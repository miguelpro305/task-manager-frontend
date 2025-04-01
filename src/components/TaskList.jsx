import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Container,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Paper,
  Stack,
  Divider,
  CircularProgress,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  useTheme
} from "@mui/material";
import { Delete, Add, Edit, CheckCircle, Pending, Done, ExpandMore } from "@mui/icons-material";

const statusConfig = {
  porhacer: {
    label: "Por hacer",
    color: "default",
    icon: <CheckCircle color="disabled" />,
    borderColor: (theme) => theme.palette.grey[500]
  },
  enprogreso: {
    label: "En progreso",
    color: "warning",
    icon: <Pending color="warning" />,
    borderColor: (theme) => theme.palette.warning.main
  },
  hecho: {
    label: "Hecho",
    color: "success",
    icon: <Done color="success" />,
    borderColor: (theme) => theme.palette.success.main
  }
};

const statusOptions = [
  { value: "por hacer", label: "Por hacer" },
  { value: "en progreso", label: "En progreso" },
  { value: "hecho", label: "Hecho" },
];

export default function TaskList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ 
    titulo: "", 
    descripcion: "", 
    estado: "por hacer" 
  });
  const [expanded, setExpanded] = useState({
    porhacer: true,
    enprogreso: true,
    hecho: true
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get("/tareas");
      setTasks(response.data);
    } catch (error) {
      console.error("Error al obtener tareas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    try {
      await api.post("/tareas", newTask);
      resetForm();
      await fetchTasks();
    } catch (error) {
      console.error("Error al agregar tarea", error);
    }
  };

  const handleUpdateTask = async () => {
    try {
      await api.put(`/tareas/${currentTask._id}`, newTask);
      resetForm();
      await fetchTasks();
    } catch (error) {
      console.error("Error al actualizar tarea", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tareas/${id}`);
      await fetchTasks();
    } catch (error) {
      console.error("Error al eliminar tarea", error);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const statusOrder = ["por hacer", "en progreso", "hecho", "por hacer"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newStatus = statusOrder[currentIndex + 1];
    
    try {
      await api.patch(`/tareas/${id}`, { estado: newStatus });
      await fetchTasks();
    } catch (error) {
      console.error("Error al actualizar estado", error);
    }
  };

  const handleEditClick = (task) => {
    setCurrentTask(task);
    setNewTask({
      titulo: task.titulo,
      descripcion: task.descripcion,
      estado: task.estado
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentTask(null);
    setNewTask({ titulo: "", descripcion: "", estado: "por hacer" });
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded({ ...expanded, [panel]: isExpanded });
  };

  // Agrupar tareas por estado
  const groupedTasks = tasks.reduce((acc, task) => {
    const key = task.estado.replace(/\s+/g, '');
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {});

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: isMobile ? 2 : 4,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        margin: '0 auto',
        width: '100%',
        maxWidth: '1200px !important',
        px: isMobile ? 2 : 3,
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: isMobile ? 2 : 3,
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          width: '100%',
          height: isMobile ? '90vh' : '80vh',
          maxHeight: '800px',
          overflow: 'hidden',
        }}
      >
        {/* Header fijo */}
        <Box sx={{ flexShrink: 0 }}>
          <Stack 
            direction={isMobile ? "column" : "row"} 
            justifyContent="space-between" 
            alignItems={isMobile ? "flex-start" : "center"}
            spacing={2}
            mb={3}
          >
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              fontWeight="bold" 
              color="primary.main"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              📋 Lista de Tareas
            </Typography>
            
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => setOpenDialog(true)}
              sx={{ 
                borderRadius: 3,
                width: isMobile ? '100%' : 'auto',
                py: 1,
                px: 3
              }}
            >
              Agregar Tarea
            </Button>
          </Stack>
          <Divider sx={{ my: 2 }} />
        </Box>

        {/* Área de contenido con scroll */}
        <Box 
          sx={{ 
            flex: 1,
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.grey[100],
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.main,
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme.palette.primary.dark,
            }
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress color="primary" size={isMobile ? 40 : 60} />
            </Box>
          ) : tasks.length > 0 ? (
            <Box>
              {Object.entries(statusConfig).map(([key, config]) => (
                <Accordion 
                  key={key}
                  expanded={expanded[key]}
                  onChange={handleAccordionChange(key)}
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      bgcolor: theme.palette.grey[50],
                      '&.Mui-expanded': {
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {config.icon}
                      <Typography variant="subtitle1" fontWeight="medium">
                        {config.label}
                      </Typography>
                      <Badge 
                        badgeContent={groupedTasks[key]?.length || 0} 
                        color={config.color}
                        sx={{ ml: 1 }}
                      />
                    </Stack>
                  </AccordionSummary>
                  
                  <AccordionDetails sx={{ p: 0 }}>
                    <List sx={{ bgcolor: 'background.paper' }}>
                      {groupedTasks[key]?.length > 0 ? (
                        groupedTasks[key].map((task) => (
                          <Paper 
                            key={task._id}
                            elevation={0}
                            sx={{ 
                              mb: 1,
                              mx: 1,
                              borderRadius: 1,
                              borderLeft: `4px solid ${config.borderColor(theme)}`,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: theme.shadows[1]
                              }
                            }}
                          >
                            <ListItem 
                              sx={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: 'flex-start',
                                py: 2,
                                pr: isMobile ? 2 : 4,
                                pl: 2
                              }}
                              secondaryAction={
                                !isMobile && (
                                  <Stack direction="row" spacing={1}>
                                    <IconButton 
                                      edge="end" 
                                      color="primary" 
                                      onClick={() => handleEditClick(task)}
                                      aria-label="editar"
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      edge="end" 
                                      color="error" 
                                      onClick={() => handleDeleteTask(task._id)}
                                      aria-label="eliminar"
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                )
                              }
                            >
                              <Box sx={{ 
                                display: 'flex', 
                                width: '100%',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: isMobile ? 'flex-start' : 'center'
                              }}>
                                <IconButton 
                                  onClick={() => handleStatusChange(task._id, task.estado)}
                                  size={isMobile ? "small" : "medium"}
                                  aria-label="cambiar estado"
                                  sx={{ 
                                    mr: isMobile ? 0 : 2,
                                    mb: isMobile ? 1 : 0
                                  }}
                                >
                                  {config.icon}
                                </IconButton>
                                
                                <Box sx={{ 
                                  flex: 1,
                                  minWidth: 0,
                                  mr: isMobile ? 0 : 2,
                                  mb: isMobile ? 2 : 0
                                }}>
                                  <ListItemText 
                                    primary={
                                      <Typography 
                                        variant={isMobile ? "subtitle1" : "h6"} 
                                        component="div"
                                        sx={{ 
                                          wordBreak: 'break-word',
                                          fontWeight: 500
                                        }}
                                      >
                                        {task.titulo}
                                      </Typography>
                                    } 
                                    secondary={
                                      task.descripcion && (
                                        <Typography 
                                          variant="body2" 
                                          color="text.secondary"
                                          sx={{ wordBreak: 'break-word' }}
                                        >
                                          {task.descripcion}
                                        </Typography>
                                      )
                                    } 
                                  />
                                </Box>
                                
                                {isMobile && (
                                  <Stack 
                                    direction="row" 
                                    spacing={1}
                                    sx={{ width: '100%', justifyContent: 'flex-end' }}
                                  >
                                    <IconButton 
                                      size="small"
                                      color="primary" 
                                      onClick={() => handleEditClick(task)}
                                      aria-label="editar"
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      size="small"
                                      color="error" 
                                      onClick={() => handleDeleteTask(task._id)}
                                      aria-label="eliminar"
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                )}
                              </Box>
                            </ListItem>
                          </Paper>
                        ))
                      ) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No hay tareas en esta categoría
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Box 
              display="flex" 
              flexDirection="column" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
              textAlign="center"
              p={4}
            >
              <Typography 
                variant="h6" 
                color="text.secondary" 
                gutterBottom
                sx={{ mb: 2 }}
              >
                No hay tareas registradas
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{ borderRadius: 3 }}
              >
                Crear primera tarea
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Diálogo para agregar/editar tareas */}
      <Dialog 
        open={openDialog} 
        onClose={resetForm}
        fullWidth
        maxWidth="sm"
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            width: isMobile ? '95%' : '100%',
            maxWidth: '600px',
            mx: 'auto',
            overflow: 'hidden'
          } 
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            py: 2,
            textAlign: 'center'
          }}
        >
          {editMode ? 'Editar Tarea' : 'Nueva Tarea'}
        </DialogTitle>
        
        <DialogContent sx={{ py: 3, px: isMobile ? 2 : 3 }}>
          <Stack spacing={3}>
            <DialogContentText 
              sx={{ 
                textAlign: 'center', 
                color: 'text.primary',
                mb: 1
              }}
            >
              {editMode ? 'Modifica los detalles de la tarea' : 'Completa los campos para agregar una nueva tarea'}
            </DialogContentText>
            
            <TextField
              autoFocus
              margin="dense"
              label="Título"
              fullWidth
              variant="outlined"
              value={newTask.titulo}
              onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })}
              sx={{ mb: 1 }}
              inputProps={{ maxLength: 100 }}
            />
            
            <TextField
              margin="dense"
              label="Descripción"
              fullWidth
              multiline
              rows={isMobile ? 3 : 4}
              variant="outlined"
              value={newTask.descripcion}
              onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })}
              inputProps={{ maxLength: 500 }}
            />
            
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={newTask.estado}
                label="Estado"
                onChange={(e) => setNewTask({ ...newTask, estado: e.target.value })}
              >
                {statusOptions.map((option) => (
                  <MenuItem 
                    key={option.value} 
                    value={option.value}
                    sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    {option.label}
                    {statusConfig[option.value.replace(/\s+/g, '')].icon}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: isMobile ? 2 : 3, 
          py: 2,
          gap: 2
        }}>
          <Button 
            onClick={resetForm} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              flex: isMobile ? 1 : 0,
              minWidth: 120
            }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={editMode ? handleUpdateTask : handleAddTask}
            disabled={!newTask.titulo.trim()}
            sx={{ 
              borderRadius: 2,
              flex: isMobile ? 1 : 0,
              minWidth: 120
            }}
          >
            {editMode ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}