import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 20, color = 'var(--accent-indigo)' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={size} color={color} className="spinner-pulse" />
    </div>
  );
};

export default Spinner;
