package controllers

import (
	"io"
	"time"
    "encoding/csv"
	"github.com/robfig/revel"
	"github.com/kbkelly/gtd-panic/app/models"
)

type Uploads struct {
	Application
}

func (c Uploads) Create() revel.Result {
	fileHeaders := c.Params.Files
	if fileHeaders == nil {
		panic("CSV was empty")
	}
	fileHeader := fileHeaders["file"][0]
	csvUpload, err := fileHeader.Open()
	if err != nil {
		panic(err)
	}
	events := readOmnifocusCsv(csvUpload)
	return c.RenderJson(events)
}

func readOmnifocusCsv(csvFile io.Reader) []*models.Event {
	var events []*models.Event
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
	    // Doesn't have a task description, skip it
	    if len(fields) < 3 {
	    	continue
	    }
	    // Only tasks labeled as Actions
	    if fields[1] != "Action" {
	    	continue
	    }
	    // Nothing in the Waiting context
	    if len(fields) > 4 && fields[4] == "Waiting" {
	    	continue
	    }
	    // These times are garbage, not sure what to do about it
    	event := &models.Event{fields[2], "2013-12-13 10:00", "2013-12-13 11:00", false}
    	events = append(events, event)	    	
    		    // Only show 16 hours worth of stuff (32 * 1/2 hr intervals)
	    if len(events) >= 32 {
	    	break	    	
	    }
	}
	// starting from now, place each event at 15 minute intervals
	current := time.Now()
	interval := time.Duration(30) * time.Minute
	layout := "2006-01-02 15:04:05" // "Mon Jan 2 15:04:05 -0700 MST 2006"
	for _, e := range events {
		e.Start = current.Format(layout)
		e.End = current.Add(interval).Format(layout)
		current = current.Add(interval)
	}
	return events
}