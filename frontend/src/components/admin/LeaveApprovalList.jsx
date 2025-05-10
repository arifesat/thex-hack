import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { leaveService } from '../../services/api';

const LeaveApprovalList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await leaveService.getLeaveRequestsForApproval();
      setRequests(data);
    } catch (error) {
      setError('İzin talepleri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      console.error('İzin talepleri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await leaveService.updateLeaveRequestStatus(requestId, 'APPROVED');
      await fetchRequests();
    } catch (error) {
      setError('İzin talebi onaylanırken bir hata oluştu.');
      console.error('İzin talebi onaylanırken hata:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      await leaveService.updateLeaveRequestStatus(selectedRequest.id, 'REJECTED', {
        rejectionReason
      });
      setDialogOpen(false);
      setRejectionReason('');
      setSelectedRequest(null);
      await fetchRequests();
    } catch (error) {
      setError('İzin talebi reddedilirken bir hata oluştu.');
      console.error('İzin talebi reddedilirken hata:', error);
    }
  };

  const openRejectDialog = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Onaylandı';
      case 'REJECTED':
        return 'Reddedildi';
      case 'PENDING':
        return 'Beklemede';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography component="h1" variant="h5" gutterBottom>
          İzin Talepleri Onayları
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {requests.length === 0 ? (
          <Alert severity="info">
            Onay bekleyen izin talebi bulunmamaktadır.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Çalışan</TableCell>
                  <TableCell>Başlangıç Tarihi</TableCell>
                  <TableCell>Bitiş Tarihi</TableCell>
                  <TableCell>Neden</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.employeeName}</TableCell>
                    <TableCell>
                      {format(new Date(request.startDate), 'dd MMMM yyyy', { locale: tr })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.endDate), 'dd MMMM yyyy', { locale: tr })}
                    </TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(request.status)}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {request.status === 'PENDING' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleApprove(request.id)}
                          >
                            Onayla
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => openRejectDialog(request)}
                          >
                            Reddet
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>İzin Talebini Reddet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Red Nedeni"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button onClick={handleReject} color="error" variant="contained">
            Reddet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveApprovalList;
