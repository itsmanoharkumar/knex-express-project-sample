'use strict'

const bcrypt = require('bcrypt')

const name = 'User'
const tableName = 'users'

// Properties that are allowed to be selected from the database for reading.
// (e.g., `password` is not included and thus cannot be selected)
const selectableProps = [
  'id',
  'username',
  'email',
  'updated_at',
  'created_at'
]

const SALT_ROUNDS = 10
const hashPassword = password => bcrypt.hash(password, SALT_ROUNDS)
const verifyPassword = (password, hash) => bcrypt.compare(password, hash)

// Always perform this logic before saving to db. This includes always hashing
// the password field prior to writing so it is never saved in plain text.
const beforeSave = user => {
  if (!user.password) return Promise.resolve(user)

  return hashPassword(user.password)
    .then(hash => ({ ...user, password: hash }))
    .catch(err => `Error hashing password: ${ err }`)
}

module.exports = knex => {
  const create = props => beforeSave(props)
    .then(user => knex.insert(user)
      .into(tableName)
      .timeout(1000)
    )

  const findAll = () => knex.select()
    .from(tableName)
    .timeout(1000)

  const find = filters => knex.select(selectableProps)
    .from(tableName)
    .where(filters)
    .timeout(1000)

  const findById = id => knex.select(selectableProps)
    .from(tableName)
    .where({ id })
    .timeout(1000)

  // TODO: handle updating password
  const update = props => beforeSave(props)
    .then(user => knex.update(user)
      .from(tableName)
      .where({ id: props.id })
      .timeout(1000)
    )

  const destroy = id => knex.del()
    .from(tableName)
    .where({ id })
    .timeout(1000)

  return {
    name,
    tableName,
    create,
    findAll,
    find,
    findById,
    update,
    destroy
  }
}
