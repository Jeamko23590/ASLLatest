'use client';

import useCanvasCursor from '@/app/hooks/use-canvasCursor';

const CanvasCursor = () => {
  useCanvasCursor();

  return <canvas className='pointer-events-none fixed inset-0 z-[999]' id='canvas' style={{ mixBlendMode: 'screen' }} />;
};

export default CanvasCursor;