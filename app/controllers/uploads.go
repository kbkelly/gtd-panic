package controllers

import (
	"io"
	"time"
	"log"
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
    	event := &models.Event{}
    	event.Title = fields[2]
    	if len(fields) > 8 && fields[8] != "" {
    		log.Print(fields[8])
    		duration, err := time.ParseDuration(fields[8])
    		if err != nil {
    			panic(err)
    		}
    		event.Duration = duration.Seconds()
    	}
    	events = append(events, event)	    	
	}
	return events
}