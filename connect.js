import mysql from "mysql2"

export const db = mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"Tangphuctoan2607@",
  database:"social"
})