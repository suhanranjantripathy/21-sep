const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

function formatAssignment(assignment) {
  return {
    ...assignment,
    deadline: assignment.deadline instanceof Date
      ? assignment.deadline.toISOString().slice(0, 10)
      : assignment.deadline,
  };
}

app.post('/assignments', async (req, res) => {
  const { title, deadline } = req.body;
  if (!title || !deadline) {
    return res.status(400).json({ message: 'title and deadline are required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO assignments (title, deadline) VALUES ($1, $2) RETURNING *',
      [title, deadline],
    );
    return res.status(201).json(formatAssignment(rows[0]));
  } catch (error) {
    console.error('Failed to create assignment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/assignments', async (req, res) => {
  try {
    const result = req.query.submitted === 'true'
      ? await pool.query(
        'SELECT * FROM assignments WHERE submitted = $1 ORDER BY id DESC',
        [true],
      )
      : await pool.query('SELECT * FROM assignments ORDER BY id DESC');
    return res.json(result.rows.map(formatAssignment));
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/assignments/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE assignments SET submitted = $1 WHERE id = $2 RETURNING *',
      [true, req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    return res.json(formatAssignment(rows[0]));
  } catch (error) {
    console.error('Failed to submit assignment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/assignments/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM assignments WHERE id = $1 RETURNING *',
      [req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    return res.json({
      message: 'Assignment deleted successfully',
      assignment: formatAssignment(rows[0]),
    });
  } catch (error) {
    console.error('Failed to delete assignment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => console.log(`Assignment portal listening on port ${port}`));
}

module.exports = app;
