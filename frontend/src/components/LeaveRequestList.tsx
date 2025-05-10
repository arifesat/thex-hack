import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import type { LeaveRequest } from '../types';
import { leaveRequestService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const LeaveRequestList: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchLeaveRequests = async () => {
    try {
      const requests = await leaveRequestService.getLeaveRequests();
      // If user is not admin, filter requests to show only their own
      if (user?.role !== 'ADMIN') {
        const userRequests = requests.filter(request => request.userId === user?.email);
        setLeaveRequests(userRequests);
      } else {
        setLeaveRequests(requests);
      }
    } catch (error) {
      toast.error('İzin talepleri yüklenirken bir hata oluştu.');
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [user]);

  const handleApprove = async (id: string) => {
    try {
      await leaveRequestService.approveLeaveRequest(id);
      toast.success('İzin talebi onaylandı!');
      fetchLeaveRequests();
    } catch (error) {
      toast.error('İzin talebi onaylanırken bir hata oluştu.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await leaveRequestService.rejectLeaveRequest(id);
      toast.success('İzin talebi reddedildi!');
      fetchLeaveRequests();
    } catch (error) {
      toast.error('İzin talebi reddedilirken bir hata oluştu.');
    }
  };

  const getStatusColor = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusText = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'Onaylandı';
      case 'REJECTED':
        return 'Reddedildi';
      default:
        return 'Beklemede';
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          {user?.role === 'ADMIN' ? 'Tüm İzin Talepleri' : 'İzin Taleplerim'}
        </Typography>
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => navigate('/new-request')}
          size="small"
        >
          <AddIcon />
        </Fab>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Başlangıç Tarihi</TableCell>
              <TableCell>Bitiş Tarihi</TableCell>
              <TableCell>Sebep</TableCell>
              <TableCell>Durum</TableCell>
              {user?.role === 'ADMIN' && <TableCell>İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user?.role === 'ADMIN' ? 5 : 4} align="center">
                  Henüz izin talebi bulunmamaktadır.
                </TableCell>
              </TableRow>
            ) : (
              leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(request.status)}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  {user?.role === 'ADMIN' && request.status === 'PENDING' && (
                    <TableCell>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleApprove(request.id)}
                        sx={{ mr: 1 }}
                      >
                        Onayla
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleReject(request.id)}
                      >
                        Reddet
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LeaveRequestList; 