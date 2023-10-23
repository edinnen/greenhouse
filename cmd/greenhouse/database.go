package greenhouse

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/dehaass/greenHouse/cmd/pb"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/proto"
)

var STORAGE_PATH = os.Getenv("STORAGE_PATH")

func (greenhouse *Greenhouse) InitializeDB() {
	greenhouse.DatabaseMutex.Lock()
	defer greenhouse.DatabaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", fmt.Sprintf("%s/%s.db", STORAGE_PATH, strings.Split(greenhouse.Device.Name, ".")[0]))
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return
	}
	defer database.Close()

	database.MustExec("CREATE TABLE IF NOT EXISTS state (state BLOB, timestamp DATETIME, PRIMARY KEY(timestamp))")
	database.MustExec("CREATE TABLE IF NOT EXISTS watered (timestamp DATETIME)")
}

func (greenhouse *Greenhouse) GetLastState() *pb.State {
	greenhouse.DatabaseMutex.Lock()
	defer greenhouse.DatabaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", fmt.Sprintf("%s/%s.db", STORAGE_PATH, strings.Split(greenhouse.Device.Name, ".")[0]))
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return nil
	}
	defer database.Close()

	rows, err := database.Query("SELECT state FROM state WHERE timestamp = (SELECT MAX(timestamp) FROM state) LIMIT 1")
	if err != nil {
		logrus.Error("Failed to query state", err)
		rows.Close()
		return nil
	}
	defer rows.Close()

	var state []byte
	if rows.Next() {
		if err := rows.Scan(&state); err != nil {
			logrus.Error("Failed to scan state", err)
			return nil
		}
	}

	var statePb pb.State
	if err := proto.Unmarshal(state, &statePb); err != nil {
		logrus.Error("Failed to unmarshal state", err)
		return nil
	}

	return &statePb
}

func (greenhouse *Greenhouse) StoreState(state *pb.State) {
	greenhouse.DatabaseMutex.Lock()
	defer greenhouse.DatabaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", fmt.Sprintf("%s/%s.db", STORAGE_PATH, strings.Split(greenhouse.Device.Name, ".")[0]))
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return
	}
	defer database.Close()

	bytes, err := proto.Marshal(state)
	if err != nil {
		logrus.Error("Failed to marshal state", err)
		return
	}

	database.MustExec("INSERT INTO state (state, timestamp) VALUES (?, ?)", bytes, time.Now())
}

func (greenhouse *Greenhouse) SetWatered() {
	greenhouse.DatabaseMutex.Lock()
	defer greenhouse.DatabaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", fmt.Sprintf("%s/%s.db", STORAGE_PATH, strings.Split(greenhouse.Device.Name, ".")[0]))
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return
	}
	defer database.Close()

	// Select from watered where timestamp > now - 1 day
	rows, err := database.Query("SELECT timestamp FROM watered WHERE timestamp = (SELECT MAX(timestamp) FROM watered)")
	if err != nil {
		logrus.Error("Failed to query database ", err)
		rows.Close()
		return
	}

	if rows.Next() {
		// Parse row
		var timestamp time.Time
		if err := rows.Scan(&timestamp); err != nil {
			logrus.Error("Failed to parse row", err)
			rows.Close()
			return
		}

		// If timestamp is from today, return
		if timestamp.Day() == time.Now().Day() {
			logrus.Info("Already watered today")
			rows.Close()
			return
		}
	}
	rows.Close() // Manually call rows.Close() so we can insert

	database.MustExec("INSERT INTO watered (timestamp) VALUES (?)", time.Now())
}

func (greenhouse *Greenhouse) CheckWateredToday() (bool, uint32) {
	greenhouse.DatabaseMutex.Lock()
	defer greenhouse.DatabaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", fmt.Sprintf("%s/%s.db", STORAGE_PATH, strings.Split(greenhouse.Device.Name, ".")[0]))
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		return false, 0
	}
	defer database.Close()

	// Select from watered where timestamp > now - 1 day
	rows, err := database.Query("SELECT timestamp FROM watered WHERE timestamp = (SELECT MAX(timestamp) FROM watered)")
	if err != nil {
		logrus.Error("Failed to query database ", err)
		rows.Close()
		return false, 0
	}
	defer rows.Close()

	if rows.Next() {
		// Parse row
		var timestamp time.Time
		if err := rows.Scan(&timestamp); err != nil {
			logrus.Error("Failed to parse row", err)
			return false, 0
		}

		// Ensure timestamp is in PST
		timestamp = timestamp.In(time.FixedZone("PST", -8*60*60))

		// If timestamp is from today, return
		if timestamp.Day() == time.Now().In(time.FixedZone("PST", -8*60*60)).Day() {
			return true, uint32(timestamp.Unix())
		}
		return false, uint32(timestamp.Unix())
	}
	return false, 0
}

func (greenhouse *Greenhouse) GetTimeseriesFromDB(from time.Time, to time.Time) (*pb.Timeseries, error) {
	greenhouse.DatabaseMutex.Lock()
	defer greenhouse.DatabaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", fmt.Sprintf("%s/%s.db", STORAGE_PATH, strings.Split(greenhouse.Device.Name, ".")[0]))
	if err != nil {
		database.Close()
		return &pb.Timeseries{}, err
	}
	defer database.Close()

	rows, err := database.Query("SELECT t.state FROM (SELECT state, timestamp, ROW_NUMBER() OVER (ORDER BY timestamp) AS rownum FROM state) t WHERE t.rownum % 5 = 0 AND t.timestamp BETWEEN ? AND ?", from, to)
	// rows, err := database.Query("SELECT state FROM state WHERE timestamp BETWEEN ? AND ?", from, to)
	if err != nil {
		logrus.Error("Failed to query state", err)
		rows.Close()
		return &pb.Timeseries{}, err
	}
	defer rows.Close()

	timeseries := pb.Timeseries{}
	for rows.Next() {
		var state []byte
		if err := rows.Scan(&state); err != nil {
			logrus.Error("Failed to scan state", err)
			return &pb.Timeseries{}, err
		}

		var statePb pb.State
		if err := proto.Unmarshal(state, &statePb); err != nil {
			logrus.Error("Failed to unmarshal state", err)
			return &pb.Timeseries{}, err
		}
		timeseries.States = append(timeseries.States, &statePb)
	}

	return &timeseries, nil
}
