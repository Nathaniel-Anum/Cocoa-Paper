import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Input, Select, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import axiosInstance from '../../Components/axiosInstance';
import { BudgetWorkflowTimeline } from '../../Pages/Routes/Budget/BudgetDesignShared';

const EVENT_TAG_COLORS = {
  GET: 'blue',
  POST: 'green',
  PATCH: 'orange',
  PUT: 'gold',
  DELETE: 'red',
};

function inferEventType(row) {
  const action = `${row.action ?? ''} ${row.resource ?? ''}`.toLowerCase();
  if (action.includes('approve') || action.includes('reject') || action.includes('submit')) {
    return 'Status Change';
  }
  if (action.includes('budget') && (row.method === 'PATCH' || row.method === 'PUT')) {
    return 'Value Modification';
  }
  if (action.includes('permission') || action.includes('role')) {
    return 'Security Alert';
  }
  return 'System Activity';
}

function groupByDay(rows) {
  return rows.reduce((acc, row) => {
    const day = dayjs(row.timestamp).format('dddd, MMM D, YYYY').toUpperCase();
    if (!acc[day]) acc[day] = [];
    acc[day].push(row);
    return acc;
  }, {});
}

const AuditTrail = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/audit-trail', {
          params: { page, limit: pageSize },
        });
        if (!isMounted) return;
        setRows(res?.data?.data ?? []);
        setTotal(res?.data?.pagination?.total ?? 0);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [page, pageSize]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const search = searchText.toLowerCase();
      const matchesSearch =
        !searchText ||
        row.user?.name?.toLowerCase().includes(search) ||
        row.user?.email?.toLowerCase().includes(search) ||
        row.action?.toLowerCase().includes(search) ||
        row.resource?.toLowerCase().includes(search) ||
        row.path?.toLowerCase().includes(search);

      const eventType = inferEventType(row);
      const matchesEvent = eventFilter === 'all' || eventType === eventFilter;
      const matchesResource =
        resourceFilter === 'all' ||
        row.resource?.toLowerCase().includes(resourceFilter.toLowerCase());

      return matchesSearch && matchesEvent && matchesResource;
    });
  }, [rows, searchText, eventFilter, resourceFilter]);

  const groupedRows = useMemo(() => groupByDay(filteredRows), [filteredRows]);

  const timelineEvents = useMemo(
    () =>
      filteredRows.slice(0, 12).map((row, index) => ({
        id: row.id ?? index,
        title: `${row.user?.name ?? 'System'} · ${row.action ?? 'Activity'}`,
        timestamp: dayjs(row.timestamp).format('HH:mm:ss · MMM D, YYYY'),
        detail: `${row.method ?? '—'} ${row.resource ?? ''}${row.path ? ` · ${row.path}` : ''}`,
        tag: inferEventType(row),
        accent:
          inferEventType(row) === 'Status Change'
            ? '#16a34a'
            : inferEventType(row) === 'Value Modification'
            ? '#9D4D01'
            : inferEventType(row) === 'Security Alert'
            ? '#ba1a1a'
            : '#582f08',
        dateLabel: dayjs(row.timestamp).format('dddd, MMM D, YYYY'),
      })),
    [filteredRows],
  );

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[#9D4D01]">
            Governance
          </p>
          <h1 className="m-0 mt-2 text-3xl font-extrabold tracking-tight text-[#582f08]">
            Immutable Governance Record
          </h1>
          <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-[#7a6859]">
            Comprehensive ledger of modifications, approvals, and system state changes across the
            budget approval management system.
          </p>
        </div>

        <div className="rounded-[24px] border border-[#ead9cb] bg-[#fdf1eb] p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#7a6859]">
                Entity / User
              </label>
              <Input
                placeholder="Search personnel..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#7a6859]">
                Event Type
              </label>
              <Select
                className="w-full"
                value={eventFilter}
                onChange={setEventFilter}
                options={[
                  { label: 'All Activity', value: 'all' },
                  { label: 'Value Modification', value: 'Value Modification' },
                  { label: 'Status Change', value: 'Status Change' },
                  { label: 'Security Alert', value: 'Security Alert' },
                  { label: 'System Activity', value: 'System Activity' },
                ]}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#7a6859]">
                Resource
              </label>
              <Select
                className="w-full"
                value={resourceFilter}
                onChange={setResourceFilter}
                options={[
                  { label: 'All Resources', value: 'all' },
                  { label: 'Budget', value: 'budget' },
                  { label: 'Financial Year', value: 'financial' },
                  { label: 'User / Role', value: 'user' },
                ]}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#7a6859]">
                Date Range
              </label>
              <DatePicker className="w-full" placeholder="Filter by date" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[28px] border border-[#ead9cb] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="m-0 text-lg font-bold text-[#582f08]">Forensic Timeline</h2>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7a6859]">
                {filteredRows.length} events
              </span>
            </div>
            {loading ? (
              <p className="text-sm text-[#7a6859]">Loading audit records...</p>
            ) : (
              <BudgetWorkflowTimeline events={timelineEvents} />
            )}
            <div className="mt-6 flex justify-center border-t border-[#ead9cb] pt-4">
              <Button
                disabled={page * pageSize >= total}
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-xl"
              >
                Load more records
              </Button>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#ead9cb] bg-white shadow-sm">
            <div className="border-b border-[#f0e6db] px-6 py-4">
              <h2 className="m-0 text-lg font-bold text-[#582f08]">Structured Log</h2>
            </div>
            <div className="max-h-[720px] overflow-y-auto p-4">
              {Object.entries(groupedRows).map(([day, dayRows]) => (
                <div key={day} className="mb-6">
                  <p className="m-0 mb-3 text-[10px] font-bold uppercase tracking-wider text-[#9D4D01]">
                    {day}
                  </p>
                  <div className="space-y-3">
                    {dayRows.map((row) => (
                      <div
                        key={row.id}
                        className="rounded-xl border border-[#ead9cb] bg-[#fffaf7] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <Tooltip title={row.user?.email}>
                              <p className="m-0 text-sm font-bold text-[#582f08]">
                                {row.user?.name ?? 'System'}
                              </p>
                            </Tooltip>
                            <p className="m-0 mt-1 text-xs text-[#7a6859]">
                              {dayjs(row.timestamp).format('HH:mm:ss')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Tag color={EVENT_TAG_COLORS[row.method] ?? 'default'}>{row.method}</Tag>
                            <Tag color="blue">{inferEventType(row)}</Tag>
                          </div>
                        </div>
                        <p className="m-0 mt-3 text-sm text-[#582f08]">{row.action}</p>
                        <p className="m-0 mt-1 text-xs text-[#7a6859]">
                          {row.resource}
                          {row.statusCode ? ` · HTTP ${row.statusCode}` : ''}
                          {row.responseTime ? ` · ${row.responseTime}ms` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {!filteredRows.length && !loading && (
                <p className="text-sm italic text-[#7a6859]">No audit records match the current filters.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;
