import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import type { TeacherRequest } from '../services/db';
import type { Language } from '../locales/translations';
import { Check, X, Clock, CheckCircle2, XCircle, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface TeacherRequestsPanelProps {
  language: Language;
}

export const TeacherRequestsPanel: React.FC<TeacherRequestsPanelProps> = ({ language }) => {
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      setErrorMsg('');
      const list = await dbService.getTeacherRequests();
      setRequests(list);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(language === 'te' ? "అభ్యర్థనలను లోడ్ చేయడం విఫలమైంది." : "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setActioningId(id);
      setErrorMsg('');
      await dbService.updateTeacherRequestStatus(id, status);
      // Reload list
      const list = await dbService.getTeacherRequests();
      setRequests(list);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (language === 'te' ? `అభ్యర్థనను ${status === 'approved' ? 'ఆమోదించడం' : 'తిరస్కరించడం'} విఫలమైంది.` : `Failed to update request to ${status}.`));
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
            <XCircle className="h-3.5 w-3.5" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200 animate-pulse">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Teacher Requests</h1>
        <p className="text-sm text-slate-400 font-medium">Review and manage registration requests submitted by teachers. Approving a request creates their account immediately.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <RefreshCw className="animate-spin rounded-full h-8 w-8 text-primary" />
        </div>
      ) : requests.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="py-4.5 px-6">Name</th>
                  <th className="py-4.5 px-6">Email / Phone</th>
                  <th className="py-4.5 px-6">Subject / Qualification</th>
                  <th className="py-4.5 px-6">Date Submitted</th>
                  <th className="py-4.5 px-6">Status</th>
                  <th className="py-4.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
                <AnimatePresence>
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6 font-bold text-slate-900">{req.name}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{req.email}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{req.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{req.subject}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{req.qualification}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(req.status)}</td>
                      <td className="py-4 px-6">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              disabled={actioningId !== null}
                              onClick={() => handleAction(req.id, 'approved')}
                              className="inline-flex items-center justify-center p-2 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 rounded-xl border border-green-150 transition cursor-pointer"
                              title="Approve & Provision Account"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              disabled={actioningId !== null}
                              onClick={() => handleAction(req.id, 'rejected')}
                              className="inline-flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl border border-red-150 transition cursor-pointer"
                              title="Reject Request"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-xs font-semibold text-slate-400">
                            {req.status === 'approved' ? 'Provisioned' : 'Rejected'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-12 text-center shadow-sm">
          <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4 border border-slate-100">
            <UserCheck className="h-6 w-6" />
          </div>
          <p className="text-slate-500 text-sm font-semibold">No teacher registration requests found.</p>
        </div>
      )}
    </div>
  );
};
