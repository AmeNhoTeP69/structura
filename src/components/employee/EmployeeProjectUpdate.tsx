import { useEffect, useState } from 'react';
import { Project, ProjectStatus, ProjectTimelineLog } from '../../types';
import { ArrowLeft, MessageSquare, CheckCircle2, Save, Eye, Users } from 'lucide-react';
import { getAuthHeaders } from '../../lib/auth';

interface EmployeeProjectUpdateProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
}

export function EmployeeProjectUpdate({ project, onBack, onUpdateProject }: EmployeeProjectUpdateProps) {
  const [localProject, setLocalProject] = useState<Project>(project);
  const [timelineLogs, setTimelineLogs] = useState<ProjectTimelineLog[]>([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [logType, setLogType] = useState<ProjectTimelineLog['logType']>('comment');
  const [visibility, setVisibility] = useState<ProjectTimelineLog['visibility']>('team-only');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(project.status);
  const [progress, setProgress] = useState(project.progress);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocalProject(project);
    setSelectedStatus(project.status);
    setProgress(project.progress);
  }, [project]);

  useEffect(() => {
    fetch(`http://localhost:5001/api/projects/${project.id}/timeline-logs`, {
      headers: getAuthHeaders(),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load project activity.');
        }

        return response.json();
      })
      .then((payload) => {
        setTimelineLogs(payload?.data || []);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [project.id]);
  
  const handlePostUpdate = async () => {
    if (!newUpdate.trim() && selectedStatus === localProject.status && progress === localProject.progress) return;

    setIsPosting(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5001/api/projects/${project.id}/timeline-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          logType: logType.replace('-', '_').toUpperCase(),
          message: newUpdate || 'Execution status updated.',
          visibility: visibility.replace('-', '_').toUpperCase(),
          progressValue: progress,
          status: selectedStatus,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Unable to publish project update.');
      }

      const nextProject = payload?.data?.project as Project;
      const nextLog = payload?.data?.timelineLog as ProjectTimelineLog;

      if (nextProject) {
        setLocalProject(nextProject);
        await onUpdateProject(nextProject);
      }

      if (nextLog) {
        setTimelineLogs((prev) => [nextLog, ...prev]);
      }

      setNewUpdate('');
      setLogType('comment');
      setVisibility('team-only');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to publish project update.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase">Update Project</h2>
          </div>
          <p className="text-slate-500 font-medium">{localProject.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[28px] p-8 shadow-sm space-y-6">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              <MessageSquare size={18} className="text-indigo-500" />
              Publish Site Update
            </h4>
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                {error}
              </div>
            ) : null}
            <div className="flex gap-4">
              <div className="flex-1 space-y-4">
                <textarea 
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  placeholder="Log daily activities, safety checks, or milestones..." 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all resize-none text-sm min-h-[100px]"
                />
                      {/* Phase Slider */}
                      {(() => {
                        const phaseMarkers = [
                          { pct: 0,   label: 'Start' },
                          { pct: 10,  label: 'Site Prep' },
                          { pct: 30,  label: 'Foundation' },
                          { pct: 55,  label: 'Structure' },
                          { pct: 75,  label: 'Enclosure' },
                          { pct: 90,  label: 'Fit-Out' },
                          { pct: 100, label: 'Done' },
                        ];
                        return (
                          <div className="space-y-2 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500 uppercase">Progress</span>
                              <span className="text-sm font-extrabold text-indigo-600">{progress}%</span>
                            </div>
                            <div className="relative pt-1">
                              <input
                                type="range"
                                min="0" max="100"
                                value={progress}
                                onChange={(e) => setProgress(Number(e.target.value))}
                                className="w-full accent-indigo-600 h-2 cursor-pointer"
                              />
                              {/* Tick marks + labels */}
                              <div className="relative w-full mt-1">
                                {phaseMarkers.map((m, idx) => (
                                  <div
                                    key={idx}
                                    className="absolute flex flex-col items-center"
                                    style={{ left: `${m.pct}%`, transform: 'translateX(-50%)' }}
                                  >
                                    <div className={`w-px h-2 ${progress >= m.pct ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                                    <span className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 whitespace-nowrap ${progress >= m.pct ? 'text-indigo-500' : 'text-slate-300'}`}>
                                      {m.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="grid gap-3 md:grid-cols-3 pt-8">
                        <select 
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value as ProjectStatus)}
                          className="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-tight text-slate-600 focus:outline-none"
                        >
                          <option value="pending">Set as Pending</option>
                          <option value="in-progress">Set in Progress</option>
                          <option value="completed">Set Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                        <select
                          value={logType}
                          onChange={(e) => setLogType(e.target.value as ProjectTimelineLog['logType'])}
                          className="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-tight text-slate-600 focus:outline-none"
                        >
                          <option value="comment">Comment</option>
                          <option value="request">Request</option>
                          <option value="note">Internal Note</option>
                          <option value="progress-update">Progress Update</option>
                          <option value="status-update">Status Update</option>
                        </select>
                        <select
                          value={visibility}
                          onChange={(e) => setVisibility(e.target.value as ProjectTimelineLog['visibility'])}
                          className="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-tight text-slate-600 focus:outline-none"
                        >
                          <option value="team-only">Team Only</option>
                          <option value="all">Visible To Client</option>
                        </select>
                      </div>

                      <div className="flex justify-end items-center gap-4">
                  <button 
                    onClick={handlePostUpdate}
                    disabled={isPosting || postSuccess}
                    className={`px-6 py-2 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                      postSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isPosting ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : postSuccess ? (
                      <><CheckCircle2 size={14} /> Posted!</>
                    ) : (
                      <><Save size={14} /> Update Project</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
            <h4 className="font-bold text-slate-900 pl-14 mb-4 uppercase tracking-tight">Recent Updates</h4>
            {timelineLogs.length === 0 && (
              <p className="pl-14 text-sm text-slate-500 italic">No updates have been posted yet.</p>
            )}
            {timelineLogs.map((log) => (
              <div key={log.id} className="relative pl-14">
                <div className="absolute left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50"></div>
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-slate-900 text-sm tracking-tight">{log.authorName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                        {log.logType.replace('-', ' ')}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                        {log.visibility === 'all' ? <Eye size={10} /> : <Users size={10} />}
                        {log.visibility === 'all' ? 'All' : 'Team'}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-[28px] p-8 shadow-sm">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Current Status</h5>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                  localProject.status === 'in-progress' ? 'bg-blue-500' :
                  localProject.status === 'completed' ? 'bg-emerald-500' :
                  localProject.status === 'on-hold' ? 'bg-rose-500' :
                  'bg-amber-500'
                }`}></div>
                <div className="text-sm">
                  <p className="font-bold text-slate-900 uppercase tracking-tight">{localProject.status.replace('-', ' ')}</p>
                  <p className="text-slate-500 mt-1 text-xs">Last updated {timelineLogs[0] ? new Date(timelineLogs[0].createdAt).toLocaleDateString() : localProject.startDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
