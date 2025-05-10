import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import type { User } from '../types';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';

// Axios instance oluştur
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Backend servisine bağlanılamıyor. Lütfen backend servisinin çalıştığından emin olun.');
    }
    return Promise.reject(error);
  }
);

interface LeaveRequest {
  id: string;
  calisanId: number;
  requestedDates: string[];
  requestStatus: string;
  remainingDays?: number;
  adSoyad?: string;
}

const LeaveRequestList: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isHR = user?.pozisyon === 'İK Uzmanı';

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token bulunamadı');
        }

        // İzin taleplerini getir
        const response = await api.get('/izin-talepleri', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.data) {
          throw new Error('İzin talepleri alınamadı');
        }

        let requests = response.data;
        
        // Her bir istek için kullanıcı bilgilerini al
        let processedRequests = await Promise.all(
          requests.map(async (request: LeaveRequest) => {
            try {
              const userResponse = await api.get(`/users/${request.calisanId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (userResponse.data) {
                return {
                  ...request,
                  remainingDays: userResponse.data.remainingDays,
                  adSoyad: userResponse.data.adSoyad
                };
              }
              return request;
            } catch (error) {
              console.error('Kullanıcı bilgileri alınamadı:', error);
              return request;
            }
          })
        );

        // İK Uzmanı değilse sadece kendi taleplerini göster
        if (user?.pozisyon !== 'İK Uzmanı') {
          processedRequests = processedRequests.filter(
            (request) => request.calisanId === user?.calisanId
          );
        }

        setRequests(processedRequests);
      } catch (error) {
        console.error('Hata:', error);
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            setError('Sunucuya bağlanırken zaman aşımı oluştu. Lütfen sayfayı yenileyin.');
          } else if (error.response?.status === 401) {
            setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            setTimeout(() => navigate('/login'), 2000);
          } else if (error.response?.status === 403) {
            setError('Bu sayfaya erişim yetkiniz yok.');
          } else {
            setError(`İzin talepleri yüklenirken bir hata oluştu: ${error.response?.data?.message || error.message}`);
          }
        } else {
          setError('Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, navigate]);

  const handleApprove = async (requestId: string) => {
    try {
      await api.put(`/izin-talepleri/${requestId}/onayla`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('İzin talebi başarıyla onaylandı');
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, requestStatus: 'ONAYLANDI' }
          : req
      ));
    } catch (error) {
      console.error('Onaylama hatası:', error);
      toast.error('İzin talebi onaylanırken bir hata oluştu');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.put(`/izin-talepleri/${requestId}/reddet`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('İzin talebi başarıyla reddedildi');
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, requestStatus: 'REDDEDİLDİ' }
          : req
      ));
    } catch (error) {
      console.error('Reddetme hatası:', error);
      toast.error('İzin talebi reddedilirken bir hata oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  const formatDateRange = (dates: string | string[]) => {
    if (Array.isArray(dates)) {
      if (dates.length === 1) {
        return formatDate(dates[0]);
      }
      // Tarihleri sırala
      const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      return `${formatDate(sortedDates[0])} - ${formatDate(sortedDates[sortedDates.length - 1])}`;
    }
    return formatDate(dates);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONAYLANDI':
        return 'success';
      case 'REDDEDİLDİ':
        return 'error';
      case 'BEKLEMEDE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRemainingDaysColor = (days: number) => {
    if (days <= 0) return 'error';
    if (days <= 5) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="error">{error}</Alert>
        <Box mt={2} display="flex" justifyContent="center">
          <Button variant="contained" onClick={() => window.location.reload()}>
            Sayfayı Yenile
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" component="h2">
            İzin Talepleri
          </Typography>
          {isHR && (
            <Chip 
              label="İK Uzmanı Görünümü" 
              color="primary" 
              size="small" 
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/new-request')}
        >
          Yeni İzin Talebi
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {isHR && <TableCell>Çalışan</TableCell>}
              <TableCell>İzin Tarihleri</TableCell>
              <TableCell>Kalan İzin Günü</TableCell>
              <TableCell>Durum</TableCell>
              {isHR && <TableCell>İşlem</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isHR ? 6 : 5} align="center">
                  Henüz izin talebi bulunmamaktadır.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  {isHR && (
                    <TableCell>{request.adSoyad || `Çalışan ID: ${request.calisanId}`}</TableCell>
                  )}
                  <TableCell>
                    {formatDateRange(request.requestedDates)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${request.remainingDays || 0} gün`}
                      color={getRemainingDaysColor(request.remainingDays || 0)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={request.requestStatus} 
                      color={getStatusColor(request.requestStatus) as any}
                      size="small"
                    />
                  </TableCell>
                  {isHR && (
                    <TableCell>
                      {request.requestStatus === 'BEKLEMEDE' && (
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleApprove(request.id)}
                            startIcon={<CheckIcon />}
                          >
                            Onayla
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleReject(request.id)}
                            startIcon={<CloseIcon />}
                          >
                            Reddet
                          </Button>
                        </Stack>
                      )}
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