package controllers

import (
	"github.com/robfig/revel"
)

type Schedule struct {
	Application
}

func (c Schedule) Show() revel.Result {
	// events := nil
	// return c.RenderJson(events)
	return nil
}

// func loadEvents() []*models.Event {
// 	return []*models.Event
// 	// events := readOmnifocusCsv()
// 	// return events
// }