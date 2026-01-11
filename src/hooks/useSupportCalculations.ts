import { useMemo } from 'react';
import { useProject } from '@/context/ProjectContext';
import { calculateSupportReport, generateSupportBoM, SupportItem, BoMItem } from '@/lib/calculations';

export const useSupportCalculations = () => {
    const {
        segments,
        glycolPercentage,
        supportConfig
    } = useProject();

    const report = useMemo<SupportItem[]>(() => {
        return calculateSupportReport(
            segments,
            glycolPercentage,
            supportConfig
        );
    }, [segments, glycolPercentage, supportConfig]);

    const bom = useMemo<BoMItem[]>(() => {
        return generateSupportBoM(report);
    }, [report]);

    const stats = useMemo(() => {
        const totalSupports = report.reduce((sum, item) => sum + item.quantity, 0);
        const criticalCount = report.filter(item => item.status === 'critical').length;
        const warningCount = report.filter(item => item.status === 'warning').length;
        return { totalSupports, criticalCount, warningCount };
    }, [report]);

    return {
        report,
        bom,
        stats
    };
};
