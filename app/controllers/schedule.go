package controllers

import (
	"os"
	"io"
    "encoding/csv"
	"github.com/robfig/revel"
	"github.com/kbkelly/gtd-panic/app/models"
)

type Schedule struct {
	Application
}

func (c Schedule) Show() revel.Result {
	events := loadEvents()
	return c.RenderJson(events)
}

func loadEvents() []*models.Event {
	events := readOmnifocusCsv()
	return events
}

func readOmnifocusCsv() []*models.Event {
	var events []*models.Event
	csvFile, err := os.Open("omnifocus.csv")
	defer csvFile.Close()
	if err != nil {
	    panic(err)
	}
	csvReader := csv.NewReader(csvFile)
	csvReader.TrailingComma = true
	csvReader.FieldsPerRecord = -1
	for {
	    fields, err := csvReader.Read()
	    if err == io.EOF {
	        break
	    } else if err != nil {
	        panic(err)
	    }
	    if len(fields) > 4 && fields[4] == "Waiting" {
	    	continue
	    }
	    if len(fields) > 2 {
	    	event := &models.Event{fields[2], "2013-12-13 10:00", "2013-12-13 11:00", false}
	    	events = append(events, event)	    	
	    }
	}
	return events
}