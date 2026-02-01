import { useState, useEffect } from 'react';

export type AgentStatus = 'Idle' | 'Thinking' | 'Working' | 'Reviewing' | 'Done';

export interface Agent {
    name: string;
    role: string;
    status: AgentStatus;
    activity?: string;
}

export const useAgents = () => {
    const [agents, setAgents] = useState<Agent[]>([
        { name: 'Director', role: 'Orchestrator', status: 'Idle' },
        { name: 'Producer', role: 'Creative', status: 'Idle' },
        { name: 'Editor', role: 'Technical', status: 'Idle' },
        { name: 'Sound Engineer', role: 'Audio', status: 'Idle' },
    ]);

    const setAgentStatus = (name: string, status: AgentStatus, activity?: string) => {
        setAgents(prev => prev.map(a => a.name === name ? { ...a, status, activity } : a));
    };

    // Simulate some initial "Agentic" life
    useEffect(() => {
        const timer = setTimeout(() => {
            setAgentStatus('Director', 'Thinking', 'Analyzing project goals...');

            setTimeout(() => {
                setAgentStatus('Producer', 'Working', 'Scouting for narrative beats...');
            }, 1500);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return { agents, setAgentStatus };
};
