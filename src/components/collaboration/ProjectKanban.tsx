import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  project_type: string;
  status: string;
  created_at: string;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to: string;
  profiles?: {
    username: string;
  };
}

export function ProjectKanban({ communityId }: { communityId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  useEffect(() => {
    fetchProjects();
  }, [communityId]);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('community_projects')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const createTask = async () => {
    if (!user || !selectedProject) return;

    try {
      const { error } = await supabase
        .from('project_tasks')
        .insert({
          project_id: selectedProject,
          created_by: user.id,
          ...newTask,
          status: 'todo'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Task created successfully'
      });

      setCreateTaskOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
      fetchTasks(selectedProject);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks(selectedProject);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
    { id: 'review', title: 'Review', status: 'review' },
    { id: 'done', title: 'Done', status: 'done' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Project Management</h2>
          <p className="text-muted-foreground">Track community projects with Kanban board</p>
        </div>
        <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedProject}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
              <Button onClick={createTask} className="w-full">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length > 0 && (
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <h3 className="font-semibold">{column.title}</h3>
              <p className="text-sm text-muted-foreground">
                {tasks.filter((t) => t.status === column.status).length} tasks
              </p>
            </div>
            <div className="space-y-3">
              {tasks
                .filter((task) => task.status === column.status)
                .map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {task.title}
                        </CardTitle>
                        <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {task.description}
                      </p>
                      {task.due_date && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
                        {column.status !== 'done' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => {
                              const nextStatus =
                                column.status === 'todo'
                                  ? 'in_progress'
                                  : column.status === 'in_progress'
                                  ? 'review'
                                  : 'done';
                              updateTaskStatus(task.id, nextStatus);
                            }}
                          >
                            Move →
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No projects yet</p>
            <p className="text-sm text-muted-foreground">Create a project to start tracking tasks</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
