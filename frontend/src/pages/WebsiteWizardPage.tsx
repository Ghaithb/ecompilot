import { Navigate } from 'react-router-dom';

/** Ancien wizard multi-étapes — redirigé vers le flux simplifié */
const WebsiteWizardPage: React.FC = () => <Navigate to="/website" replace />;

export default WebsiteWizardPage;
