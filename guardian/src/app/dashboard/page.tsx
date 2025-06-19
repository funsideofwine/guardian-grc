"use client";

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import Breadcrumb from '../../components/Breadcrumb';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const initialWidgets = [
  {
    id: 'compliance',
    content: (
      <div className="flex flex-col items-start">
        <span className="text-sm text-muted mb-2">Compliance Score</span>
        <span className="text-4xl font-bold text-primary mb-1">92%</span>
        <span className="text-sm text-muted">Your organization is 92% compliant with current policies.</span>
      </div>
    ),
  },
  {
    id: 'risks',
    content: (
      <div className="flex flex-col items-start">
        <span className="text-sm text-muted mb-2">Open Risks</span>
        <span className="text-4xl font-bold text-danger mb-1">7</span>
        <span className="text-sm text-muted">There are 7 open risks requiring attention.</span>
      </div>
    ),
  },
  {
    id: 'policies',
    content: (
      <div className="flex flex-col items-start">
        <span className="text-sm text-muted mb-2">Active Policies</span>
        <span className="text-4xl font-bold text-success mb-1">15</span>
        <span className="text-sm text-muted">15 policies are currently active and enforced.</span>
      </div>
    ),
  },
  {
    id: 'compliance-trend',
    content: (
      <div className="flex flex-col items-start w-full">
        <span className="text-sm text-muted mb-2">Compliance Trend</span>
        <Line
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Compliance %',
                data: [85, 88, 90, 91, 92, 92],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.2)',
                tension: 0.4,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: false },
            },
            scales: {
              y: { min: 80, max: 100, ticks: { stepSize: 5 } },
            },
          }}
        />
      </div>
    ),
  },
];

export default function DashboardPage() {
  const [widgets, setWidgets] = useState(initialWidgets);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(widgets);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setWidgets(reordered);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />
      <h1 className="text-3xl font-bold text-primary mb-4">Dashboard</h1>
      <p className="text-lg text-muted mb-8">Welcome to your Guardian dashboard. Select a section from the sidebar to get started.</p>
      {/* Dashboard Grid System with Drag-and-Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dashboard-widgets" direction="horizontal">
          {(provided) => (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {widgets.map((widget, idx) => (
                <Draggable key={widget.id} draggableId={widget.id} index={idx}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card>{widget.content}</Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {/* Button Showcase */}
      <div className="flex gap-4 mb-8">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="muted">Muted</Button>
      </div>
      {/* Sample Table */}
      <Card>
        <h2 className="text-xl font-bold text-primary mb-4">Team Members</h2>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Alice</td>
              <td>Admin</td>
              <td><span className="badge bg-success">Active</span></td>
            </tr>
            <tr>
              <td>Bob</td>
              <td>Manager</td>
              <td><span className="badge bg-danger">Inactive</span></td>
            </tr>
            <tr>
              <td>Carol</td>
              <td>Analyst</td>
              <td><span className="badge bg-success">Active</span></td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </div>
  );
} 