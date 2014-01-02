package controllers

import (
	// "database/sql"
	"github.com/coopernurse/gorp"
	_ "github.com/mattn/go-sqlite3"
	"encoding/json"
	rev "github.com/robfig/revel"
	"github.com/robfig/revel/modules/db/app"
	"github.com/kbkelly/gtd-panic/app/models"
)

var (
	Dbm *gorp.DbMap
)

func Init() {
	db.Init()
	Dbm = &gorp.DbMap{Db: db.Db, Dialect: gorp.SqliteDialect{}}

	setColumnSizes := func(t *gorp.TableMap, colSizes map[string]int) {
		for col, size := range colSizes {
			t.ColMap(col).MaxSize = size
		}
	}

	t := Dbm.AddTable(models.Event{}).SetKeys(true, "Id")
	setColumnSizes(t, map[string]int{
		"Title": 255,
		"Start": 24,
		"End": 24,
	})

	Dbm.AddTable(models.Schedule{}).SetKeys(true, "Id")

	Dbm.TraceOn("[gorp]", rev.INFO)
	err := Dbm.CreateTablesIfNotExists()
	if err != nil {
		panic(err)
	}
}

type Schedules struct {
	Application
}

func (c Schedules) Create() rev.Result {
	Init()
	var events []*models.Event
	err := json.NewDecoder(c.Request.Body).Decode(&events)
	if err != nil {
		rev.ERROR.Println(err)
	}
	schedule := createSchedule(events)
	return c.Redirect("/schedules/%d", schedule.Id)
}

func (c Schedules) Show(id int) rev.Result {
	Init()
	events, err := Dbm.Select(models.Event{}, "SELECT * FROM Event where ScheduleId = ?", id)
	if err != nil {
		panic(err)
	}
	return c.RenderJson(events)
}

func createSchedule(events []*models.Event) *models.Schedule {
	schedule := &models.Schedule{}
	err := Dbm.Insert(schedule)
	if err != nil {
		panic(err)
	}
	for _, event := range events {
		event.ScheduleId = schedule.Id
		err := Dbm.Insert(event)
		if err != nil {
			panic(err)
		}
	}
	return schedule
}