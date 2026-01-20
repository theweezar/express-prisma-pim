import 'dotenv/config'
import express from 'express'
import systemEntityRoutes from './api/routes/systemEntityRoutes';
import attributeDefinitionRoutes from './api/routes/attributeDefinitionRoutes';
import attributeGroupRoutes from './api/routes/attributeGroupRoutes';
import attributeGroupAssignmentRoutes from './api/routes/attributeGroupAssignmentRoutes';
import errorHandler from './api/middleware/errorHandler';

const app = express()

app.use(express.json())

// Health check
app.get(`/health`, (req, res) => {
  res.json({ status: 'ok' })
})

// API Routes
app.use('/entities', systemEntityRoutes);
// app.use('/attribute-definitions', attributeDefinitionRoutes);
// app.use('/attribute-groups', attributeGroupRoutes);
// app.use('/attribute-group-assignments', attributeGroupAssignmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  console.log(`
🚀 Server ready at: http://localhost:${PORT}
⭐️ See API documentation: src/api/API_DOCUMENTATION.md`),
)

export default app;
