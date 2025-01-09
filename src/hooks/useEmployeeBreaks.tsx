import { useState, useEffect } from 'react';
import { EmployeeBreakService } from '@/lib/services/employee-break-service';
import { EmployeeShiftStatus } from '@/types/events';

export const useEmployeeBreaks = () => {
  const [activeShifts, setActiveShifts] = useState<EmployeeShiftStatus[]>([]);
  const breakService = EmployeeBreakService.getInstance();

  useEffect(() => {
    // Subscribe to updates from the break service
    const unsubscribe = breakService.subscribe(setActiveShifts);
    return () => unsubscribe();
  }, []);

  return {
    activeShifts,
    clockIn: breakService.handleClockIn.bind(breakService),
    clockOut: breakService.handleClockOut.bind(breakService)
  };
};