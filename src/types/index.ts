export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  createdAt: Date;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  career: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  qrCode: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: string;
  toolId: string;
  studentId: string;
  loanDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'active' | 'returned' | 'overdue';
  adminId: string;
  notes?: string;
  ticketCode: string;
}

export interface LoanWithDetails extends Loan {
  tool: Tool;
  student: Student;
  admin: User;
}