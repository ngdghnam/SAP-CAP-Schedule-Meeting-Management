import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { DataTable, Badge, Button, FilterBar, VariantSelector } from '@cnma/react-ui';
import type { Variant } from '@cnma/react-ui';
import { useODataQuery } from '@/hooks/useODataQuery';
import { meetingService } from '@/services/domain/meetingService';
import { meetingsFilterConfig } from '@/config/worklist/meetingsFilterConfig';
import { ODataQueryBuilder, ODataFilter } from '@/services/core/odataHelper';
import { Plus } from 'lucide-react';

export function MeetingsPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<Record<string, any>>({});
    
    interface AppVariant extends Variant {
        filterData?: any;
    }
    
    // Variant Management State
    const [variants, setVariants] = useState<AppVariant[]>([
        { id: 'standard', name: 'Standard', isDefault: true, filterData: {} },
        { id: 'online', name: 'My Online Meetings', isDefault: false, filterData: { isOnline: 'true' } }
    ]);
    const [activeVariantId, setActiveVariantId] = useState<string | null>('standard');

    // Adapt Filters State
    const [visibleFilterKeys, setVisibleFilterKeys] = useState<string[]>(['title', 'status_code']);
    
    const visibleConfig = useMemo(() => 
        meetingsFilterConfig.filter(f => visibleFilterKeys.includes(f.key)), 
    [visibleFilterKeys]);

    const { data: resp, isLoading } = useODataQuery(
        ['meetings', filters],
        () => {
            const q = new ODataQueryBuilder()
                .expand('room,organizer')
                .orderBy('startTime', 'desc')
                .count();

            const conditions = [];
            if (filters.title) conditions.push(ODataFilter.containsIgnoreCase('title', filters.title));
            if (filters.status_code) conditions.push(ODataFilter.eq('status_code', filters.status_code));
            if (filters.isOnline) conditions.push(ODataFilter.eq('isOnline', filters.isOnline === 'true'));
            
            if (conditions.length > 0) {
                q.filter(ODataFilter.and(...conditions));
            }

            return meetingService.getList(q);
        }
    );

    const meetings = resp?.value || [];

    const columns: any[] = [
        { key: 'title', labelKey: 'Meeting Title' },
        { 
            key: 'startTime', 
            labelKey: 'Start Time',
            cell: ({ row }: any) => new Date(row.original.startTime).toLocaleString()
        },
        { 
            key: 'room.name', 
            labelKey: 'Room',
            cell: ({ row }: any) => row.original.room?.name || (row.original.isOnline ? 'Online' : 'TBD')
        },
        { 
            key: 'organizer.name', 
            labelKey: 'Organizer',
            cell: ({ row }: any) => row.original.organizer?.name || 'Unknown'
        },
        { 
            key: 'status_code', 
            labelKey: 'Status',
            cell: ({ row }: any) => {
                const status = row.original.status_code;
                if (status === 'IN_PROGRESS') return <Badge variant="warning">In Progress</Badge>;
                if (status === 'COMPLETED') return <Badge variant="success">Completed</Badge>;
                if (status === 'CANCELLED') return <Badge variant="destructive">Cancelled</Badge>;
                return <Badge variant="secondary">Scheduled</Badge>;
            }
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Meetings</h1>
                <Button onClick={() => navigate('/meetings/new')} className="gap-2">
                    <Plus size={16} /> New Meeting
                </Button>
            </div>

            <FilterBar 
                headerLeft={
                    <VariantSelector 
                        variants={variants}
                        activeVariantId={activeVariantId}
                        onSelectVariant={(v) => {
                            setActiveVariantId(v?.id || null);
                            const selectedVariant = variants.find(appVar => appVar.id === v?.id);
                            if (selectedVariant && selectedVariant.filterData) {
                                setFilters(selectedVariant.filterData);
                            } else {
                                setFilters({});
                            }
                        }}
                        onSaveVariant={(name, isDefault) => {
                            const newVar: AppVariant = { id: Date.now().toString(), name, isDefault, filterData: filters };
                            setVariants(prev => [...prev, newVar]);
                            setActiveVariantId(newVar.id);
                        }}
                        onDeleteVariant={(id) => {
                            setVariants(prev => prev.filter(v => v.id !== id));
                        }}
                    />
                }
                config={visibleConfig} 
                allFilterConfig={meetingsFilterConfig}
                onAdaptFilter={(adapted) => {
                    // adapted returns { name, label, visible }
                    setVisibleFilterKeys(adapted.filter(f => f.visible).map(f => f.name));
                }}
                values={filters}
                onChange={setFilters}
                onApply={setFilters}
            />
            
            <DataTable 
                title="All Meetings"
                columns={columns} 
                data={meetings} 
                isLoading={isLoading}
                onRowClick={(row) => navigate(`/meetings/${row.ID}`)}
            />
        </div>
    );
}
