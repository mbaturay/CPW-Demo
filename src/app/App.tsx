import { RouterProvider } from 'react-router';
import { router } from './routes';
import { RoleProvider } from './context/RoleContext';
import { DemoProvider } from './context/DemoContext';

export default function App() {
  return (
    <RoleProvider>
      <DemoProvider>
        <RouterProvider router={router} />
      </DemoProvider>
    </RoleProvider>
  );
}