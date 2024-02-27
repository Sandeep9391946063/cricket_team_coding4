const express = require('express')
const path = require('path')
const {open} = require('sqlite')

const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dpPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dpPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// get list
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT * 
    FROM
    cricket_team;
    `
  const playerArray = await db.all(getPlayersQuery)
  response.send(
    playerArray.map(eachplayer => convertDbObjectToResponseObject(eachplayer)),
  )
})
// get a player
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuery = `
  SELECT
   *
   FROM
    criket_team 
   WHERE player_id = ${playerId}; `
  const player = await db.get(getPlayersQuery)
  response.send(convertDbObjectToResponseObject(player))
})

//create a new player

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body

  const addPlayerQuery = `
  INSERT INTO
   cricket_team (player_name,jersey_number,role)
   VALUES (
      '${playerName}',
      '${jerseyNumber}',
      '${role}'
   )`
  const dbResponse = await db.run(addPlayerQuery)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})

// update player
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const {playerName, jerseyNumber, role} = request.body

  const updatePlayerQuery = `
  UPDATE 
  cricket_team
  SET 
  player_name = '${playerName}' 
  jersey_number = '${jerseyNumber}'
  role = '${role}'
  WHERE player_id = ${playerId};
  `
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

// delete book API

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE  FROM 
    cricket_team 
    WHERE player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
