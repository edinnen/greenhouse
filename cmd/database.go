package main

import (
	"database/sql"
	"fmt"
	"os"
	"sync"

	"github.com/dehaass/greenHouse/cmd/pb"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

var databaseMutex *sync.Mutex

var STORAGE_PATH = fmt.Sprintf("%s/control.db", os.Getenv("STORAGE_PATH"))

// const STORAGE_PATH = "control.db"

func InitializeDB() {
	databaseMutex = &sync.Mutex{}
	databaseMutex.Lock()
	defer databaseMutex.Unlock()
	logrus.Infof("Creating database at %s", STORAGE_PATH)
	database, err := sqlx.Open("sqlite3", STORAGE_PATH)
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return
	}
	defer database.Close()

	database.MustExec("CREATE TABLE IF NOT EXISTS device_types (id INTEGER PRIMARY KEY, name TEXT, description TEXT)")
	database.MustExec("INSERT OR IGNORE INTO device_types (id, name, description) VALUES (1, 'Greenhouse', 'A greenhouse instance')")
	database.MustExec("INSERT OR IGNORE INTO device_types (id, name, description) VALUES (2, 'Irrigator', 'An irrigation system')")
	database.MustExec("INSERT OR IGNORE INTO device_types (id, name, description) VALUES (3, 'Sensor', 'A generic sensor')")

	database.MustExec("CREATE TABLE IF NOT EXISTS devices (id INTEGER PRIMARY KEY, name TEXT, type INTEGER, ip TEXT, mac TEXT, adopted INTEGER, zone INTEGER, FOREIGN KEY(type) REFERENCES device_types(id), FOREIGN KEY(zone) REFERENCES zones(id))")
	database.MustExec("CREATE TABLE IF NOT EXISTS zones (id INTEGER PRIMARY KEY, name TEXT)")

	// chmod 777 the database
	os.Chmod(STORAGE_PATH, 0777)
}

func GetDevices() (*pb.Devices, error) {
	databaseMutex.Lock()
	defer databaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", STORAGE_PATH)
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return nil, err
	}
	defer database.Close()

	rows, err := database.Query("SELECT id, name, type, ip, mac, adopted, zone FROM devices")
	if err != nil {
		logrus.Error("Failed to query devices", err)
		rows.Close()
		return nil, err
	}
	defer rows.Close()

	var devices pb.Devices
	for rows.Next() {
		var device pb.Device
		var deviceType int
		if err := rows.Scan(&device.Id, &device.Name, &deviceType, &device.Ip, &device.Mac, &device.Adopted, &device.Zone); err != nil {
			logrus.Error("Failed to scan state", err)
			return nil, err
		}

		device.Type = pb.Device_Type(deviceType)

		if device.Adopted {
			devices.Adopted = append(devices.Adopted, &device)
		} else {
			devices.Orphaned = append(devices.Orphaned, &device)
		}
	}

	return &devices, nil
}

func GetDevice(name string) (*pb.Device, error) {
	databaseMutex.Lock()
	defer databaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", STORAGE_PATH)
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return nil, err
	}
	defer database.Close()

	var device pb.Device
	err = database.Get(&device, "SELECT id, name, type, ip, mac, adopted, zone FROM devices WHERE name = ?", name)
	if err != nil {
		return nil, err
	}

	return &device, nil
}

func CreateDevice(device *pb.Device) (bool, error) {
	databaseMutex.Lock()
	defer databaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", STORAGE_PATH)
	if err != nil {
		database.Close()
		return false, err
	}
	defer database.Close()

	// Check if device already exists
	var count int
	err = database.Get(&count, "SELECT COUNT(*) FROM devices WHERE name = ?", device.Name)
	if err != nil {
		return false, err
	}
	if count > 0 {
		return false, nil
	}

	_, err = database.Exec("INSERT INTO devices (name, type, ip, mac, adopted, zone) VALUES (?, ?, ?, ?, 0, ?)", device.Name, device.Type.Number(), device.Ip, device.Mac, device.Zone)
	if err != nil {
		return false, err
	}

	return true, nil
}

func UpdateDevice(device *pb.Device) (sql.Result, error) {
	databaseMutex.Lock()
	defer databaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", STORAGE_PATH)
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return nil, err
	}
	defer database.Close()

	return database.Exec("UPDATE devices SET name = ?, type = ?, ip = ?, mac = ?, adopted = ?, zone = ? WHERE name = ?", device.Name, device.Type.Number(), device.Ip, device.Mac, device.Adopted, device.Zone, device.Name)
}

func CreateZone(zone *pb.Zone) (bool, error) {
	databaseMutex.Lock()
	defer databaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", STORAGE_PATH)
	if err != nil {
		database.Close()
		return false, err
	}
	defer database.Close()

	// Check if zone already exists
	var count int
	err = database.Get(&count, "SELECT COUNT(*) FROM zones WHERE name = ?", zone.Name)
	if err != nil {
		return false, err
	}
	if count > 0 {
		return false, nil
	}

	_, err = database.Exec("INSERT INTO zones (name) VALUES (?)", zone.Name)
	if err != nil {
		return false, err
	}

	return true, nil
}

func UpdateZone(zone *pb.Zone) (sql.Result, error) {
	databaseMutex.Lock()
	defer databaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", STORAGE_PATH)
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return nil, err
	}
	defer database.Close()

	return database.Exec("UPDATE zones SET name = ? WHERE name = ?", zone.Name, zone.Name)
}

func DeleteZone(zone *pb.Zone) (sql.Result, error) {
	databaseMutex.Lock()
	defer databaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", STORAGE_PATH)
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return nil, err
	}
	defer database.Close()

	return database.Exec("DELETE FROM zones WHERE name = ?", zone.Name)
}

func GetZones() (*pb.Zones, error) {
	databaseMutex.Lock()
	defer databaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", STORAGE_PATH)
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return nil, err
	}
	defer database.Close()

	rows, err := database.Query("SELECT id, name FROM zones")
	if err != nil {
		logrus.Error("Failed to query zones", err)
		rows.Close()
		return nil, err
	}
	defer rows.Close()

	var zones pb.Zones
	for rows.Next() {
		var zone pb.Zone
		if err := rows.Scan(&zone.Id, &zone.Name); err != nil {
			logrus.Error("Failed to scan state", err)
			return nil, err
		}

		zones.Zones = append(zones.Zones, &zone)
	}

	devices, err := database.Query("SELECT id, name, type, ip, mac, adopted, zone FROM devices")
	if err != nil {
		logrus.Error("Failed to query devices", err)
		devices.Close()
		return nil, err
	}
	defer devices.Close()

	for devices.Next() {
		var device pb.Device
		if err := devices.Scan(&device.Id, &device.Name, &device.Type, &device.Ip, &device.Mac, &device.Adopted, &device.Zone); err != nil {
			logrus.Error("Failed to scan state", err)
			return nil, err
		}

		for _, zone := range zones.Zones {
			if zone.Id == device.Zone {
				zone.Devices = append(zone.Devices, &device)
			}
		}
	}

	return &zones, nil
}

func GetZone(id int32) (*pb.Zone, error) {
	databaseMutex.Lock()
	defer databaseMutex.Unlock()
	database, err := sqlx.Open("sqlite3", STORAGE_PATH)
	if err != nil {
		logrus.Error("Failed to open SQL database", err)
		database.Close()
		return nil, err
	}
	defer database.Close()

	var zone pb.Zone
	err = database.Get(&zone, "SELECT id, name FROM zones WHERE id = ?", id)
	if err != nil {
		return nil, err
	}

	// Get devices in zone
	rows, err := database.Query("SELECT id, name, type, ip, mac, adopted, zone FROM devices WHERE zone = ?", id)
	if err != nil {
		logrus.Error("Failed to query devices", err)
		rows.Close()
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var device pb.Device
		if err := rows.Scan(&device.Id, &device.Name, &device.Type, &device.Ip, &device.Mac, &device.Adopted, &device.Zone); err != nil {
			logrus.Error("Failed to scan state", err)
			return nil, err
		}

		zone.Devices = append(zone.Devices, &device)
	}

	return &zone, nil
}
