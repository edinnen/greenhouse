package camera

import (
	"bytes"
	"flag"
	"fmt"
	"image"
	"image/jpeg"
	"sort"
	"time"

	"github.com/blackjack/webcam"
	"github.com/sirupsen/logrus"
)

const (
	V4L2_PIX_FMT_PJPG = 0x47504A50
	V4L2_PIX_FMT_YUYV = 0x56595559
)

type FrameSizes []webcam.FrameSize

func (slice FrameSizes) Len() int {
	return len(slice)
}

//For sorting purposes
func (slice FrameSizes) Less(i, j int) bool {
	ls := slice[i].MaxWidth * slice[i].MaxHeight
	rs := slice[j].MaxWidth * slice[j].MaxHeight
	return ls < rs
}

//For sorting purposes
func (slice FrameSizes) Swap(i, j int) {
	slice[i], slice[j] = slice[j], slice[i]
}

var supportedFormats = map[webcam.PixelFormat]bool{
	V4L2_PIX_FMT_PJPG: true,
	V4L2_PIX_FMT_YUYV: true,
}

func InitializeCamera(li chan *bytes.Buffer) {
	dev := flag.String("d", "/dev/video0", "video device to use")
	fmtstr := flag.String("f", "", "video format to use, default first supported")
	szstr := flag.String("s", "", "frame size to use, default largest one")
	fps := flag.Bool("p", false, "print fps info")
	flag.Parse()

	cam, err := webcam.Open(*dev)
	if err != nil {
		logrus.Error(err.Error())
		return
	}
	defer cam.Close()

	// select pixel format
	format_desc := cam.GetSupportedFormats()

	var format webcam.PixelFormat
FMT:
	for f, s := range format_desc {
		if *fmtstr == "" {
			if supportedFormats[f] {
				format = f
				break FMT
			}

		} else if *fmtstr == s {
			if !supportedFormats[f] {
				logrus.Info(format_desc[f], "format is not supported, exiting")
				return
			}
			format = f
			break
		}
	}
	if format == 0 {
		logrus.Info("No format found, exiting")
		return
	}

	// select frame size
	frames := FrameSizes(cam.GetSupportedFrameSizes(format))
	sort.Sort(frames)

	var size *webcam.FrameSize
	if *szstr == "" {
		size = &frames[len(frames)-1]
	} else {
		for _, f := range frames {
			logrus.Info(f.GetString(), *szstr, f.GetString() == *szstr)
			if *szstr == f.GetString() {
				size = &f
			}
		}
	}
	if size == nil {
		logrus.Info("No matching frame size, exiting")
		return
	}

	f, w, h, err := cam.SetImageFormat(format, uint32(size.MaxWidth), uint32(size.MaxHeight))
	if err != nil {
		logrus.Info("SetImageFormat return error", err)
		return

	}
	// start streaming
	err = cam.StartStreaming()
	if err != nil {
		logrus.Error(err)
		return
	}

	var (
		fi   chan []byte   = make(chan []byte)
		back chan struct{} = make(chan struct{})
	)
	go encodeToImage(cam, back, fi, li, w, h, f)

	timeout := uint32(5) //5 seconds
	start := time.Now()
	var fr time.Duration

	for {
		err = cam.WaitForFrame(timeout)
		if err != nil {
			logrus.Error(err)
			return
		}

		switch err.(type) {
		case nil:
		case *webcam.Timeout:
			logrus.Error(err)
			continue
		default:
			logrus.Error(err)
			return
		}

		frame, err := cam.ReadFrame()
		if err != nil {
			logrus.Error(err)
			return
		}
		if len(frame) != 0 {

			// print framerate info every 10 seconds
			fr++
			if *fps {
				if d := time.Since(start); d > time.Second*10 {
					fmt.Println(float64(fr)/(float64(d)/float64(time.Second)), "fps")
					start = time.Now()
					fr = 0
				}
			}

			select {
			case fi <- frame:
				<-back
			default:
			}
		}
	}
}

func encodeToImage(wc *webcam.Webcam, back chan struct{}, fi chan []byte, li chan *bytes.Buffer, w, h uint32, format webcam.PixelFormat) {
	var (
		frame []byte
		img   image.Image
	)

	for {
		bframe := <-fi
		// copy frame
		if len(frame) < len(bframe) {
			frame = make([]byte, len(bframe))
		}
		copy(frame, bframe)
		back <- struct{}{}

		switch format {
		case V4L2_PIX_FMT_YUYV:
			yuyv := image.NewYCbCr(image.Rect(0, 0, int(w), int(h)), image.YCbCrSubsampleRatio422)
			for i := range yuyv.Cb {
				ii := i * 4
				yuyv.Y[i*2] = frame[ii]
				yuyv.Y[i*2+1] = frame[ii+2]
				yuyv.Cb[i] = frame[ii+1]
				yuyv.Cr[i] = frame[ii+3]

			}
			img = yuyv
		default:
			logrus.Error("invalid format ?")
		}
		//convert to jpeg
		buf := &bytes.Buffer{}
		if err := jpeg.Encode(buf, img, nil); err != nil {
			logrus.Error(err)
			return
		}

		const N = 50
		// broadcast image up to N ready clients
		nn := 0
	FOR:
		for ; nn < N; nn++ {
			select {
			case li <- buf:
			default:
				break FOR
			}
		}
		if nn == 0 {
			li <- buf
		}

	}
}
