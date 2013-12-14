package models

import (
	"time"
)

type Event struct {
	Title	string `json:"title"`
	Start	string `json:"start"`
	End		string `json:"end"`
	AllDay	bool `json:"allDay"`
	Duration time.Duration
}