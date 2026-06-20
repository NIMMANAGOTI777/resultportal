import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import type { School } from '../services/db';
import { useTranslation } from '../locales/translations';
import type { Language } from '../locales/translations';
import { Save, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface BrandingSettingsProps {
  language: Language;
  onBrandingChange?: () => void;
}

export const BrandingSettings: React.FC<BrandingSettingsProps> = ({ language, onBrandingChange }) => {
  const { t } = useTranslation(language);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [school, setSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    school_name: '',
    school_code: '',
    logo_url: '',
    address: '',
    academic_year: '',
    footer_text: ''
  });

  useEffect(() => {
    async function loadSchool() {
      try {
        setLoading(true);
        const data = await dbService.getSchoolSettings();
        setSchool(data);
        setFormData({
          school_name: data.school_name,
          school_code: data.school_code,
          logo_url: data.logo_url,
          address: data.address,
          academic_year: data.academic_year,
          footer_text: data.footer_text
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSchool();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updated = await dbService.updateSchoolSettings({
        id: school.id,
        ...formData
      });
      setSchool(updated);
      setSuccessMsg(t('settingsSaved'));
      if (onBrandingChange) {
        onBrandingChange();
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (window.confirm("Are you sure you want to reset branding to standard defaults?")) {
      setFormData({
        school_name: "ZPHS AGAMOTHKUR",
        school_code: "28160200501",
        logo_url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200",
        address: "Madugulapally Mandal, Nalgonda District, Telangana - 508228",
        academic_year: "2025-2026",
        footer_text: "Note: Regular attendance and home study are key to academic success. Keep learning!"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('schoolSettings')}</h1>
        <p className="text-sm text-slate-400 font-medium">Configure public branding, official report card logo, and school metadata.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center gap-2.5 text-sm font-semibold animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-2.5 text-sm font-semibold animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-550" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two Column Layout: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] border border-slate-100 p-6 space-y-6 lg:col-span-2">
          
          {/* Section 1: School Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest border-b border-slate-50 pb-2">
              1. School Identity
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="branding-school-name" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {t('schoolName')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="branding-school-name"
                  name="school_name"
                  type="text"
                  required
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-sm text-slate-800 font-semibold transition bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="branding-school-code" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {t('schoolCode')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="branding-school-code"
                  name="school_code"
                  type="text"
                  required
                  value={formData.school_code}
                  onChange={(e) => setFormData({ ...formData, school_code: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-sm text-slate-800 font-semibold tracking-wide transition bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="branding-academic-year" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {t('academicYear')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="branding-academic-year"
                  name="academic_year"
                  type="text"
                  required
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-sm text-slate-800 font-semibold transition bg-slate-50/50 focus:bg-white"
                  placeholder="e.g. 2025-2026"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Visual Branding */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest border-b border-slate-50 pb-2">
              2. Visual Branding
            </h3>
            
            <div className="space-y-1">
              <label htmlFor="branding-logo-url" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {t('logoUrl')}
              </label>
              <div className="flex gap-4 items-center">
                <input
                  id="branding-logo-url"
                  name="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-sm text-slate-800 font-medium transition bg-slate-50/50 focus:bg-white"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Printing Details */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest border-b border-slate-50 pb-2">
              3. Address & Print Guidelines
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label htmlFor="branding-address" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {t('schoolAddress')}
                </label>
                <textarea
                  id="branding-address"
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-sm text-slate-800 font-semibold transition bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="branding-footer-text" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {t('footerText')}
                </label>
                <textarea
                  id="branding-footer-text"
                  name="footer_text"
                  rows={2}
                  value={formData.footer_text}
                  onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-sm text-slate-650 font-semibold transition bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={resetToDefault}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset to Defaults
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/10 transition cursor-pointer"
            >
              <Save className="h-4.5 w-4.5" />
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </form>

        {/* Live Preview Widget (Stripe-like dashboard mockup) */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">
            Portal Header Preview
          </h3>
          
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
            
            {/* Header Mockup */}
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="w-10 h-10 rounded-xl border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center bg-slate-50">
                <img
                  src={formData.logo_url}
                  alt="Logo Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200";
                  }}
                />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {formData.school_name || "ZPHS AGAMOTHKUR"}
                </h4>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5 block truncate">
                  {formData.address ? formData.address.split(',')[0] + ', ' + (formData.address.split(',')[1] || '') : "Madugulapally Mandal"}
                </span>
              </div>
            </div>

            {/* Portal Banner Preview */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center space-y-2">
              <span className="inline-block px-2 py-0.5 bg-blue-50 text-primary border border-blue-100/50 rounded-full text-[9px] font-bold">
                {formData.school_name || "ZPHS AGAMOTHKUR"}
              </span>
              <h5 className="text-[11px] font-bold text-slate-700 leading-snug">
                Cumulative Report Card Footer:
              </h5>
              <p className="text-[10px] text-slate-550 leading-relaxed font-medium italic">
                "{formData.footer_text || "Regular attendance is key..."}"
              </p>
            </div>

            <div className="text-[10px] text-slate-400 font-bold text-center">
              Preview updates automatically in real-time.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
