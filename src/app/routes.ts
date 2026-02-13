import { createBrowserRouter } from 'react-router';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import WaterSelect from './pages/WaterSelect';
import WaterProfile from './pages/WaterProfile';
import SurveyUpload from './pages/SurveyUpload';
import Validation from './pages/Validation';
import QueryBuilder from './pages/QueryBuilder';
import Insights from './pages/Insights';
import ActivityFeed from './pages/ActivityFeed';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'water', Component: WaterSelect },
      { path: 'water/profile', Component: WaterProfile },
      { path: 'upload', Component: SurveyUpload },
      { path: 'validation', Component: Validation },
      { path: 'query', Component: QueryBuilder },
      { path: 'insights', Component: Insights },
      { path: 'activity-feed', Component: ActivityFeed },
    ],
  },
]);