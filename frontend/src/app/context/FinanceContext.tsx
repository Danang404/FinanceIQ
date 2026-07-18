"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Orchestrator } from '../../services/agents/Orchestrator';
import { RiskProfileResult, WealthAllocationResult, StressTestResult, ReasoningTrace, AgentPlan, MarketInstrument, MarketSummary } from '../../services/agents/types';
import { useAuthContext } from './AuthContext';

interface FinanceContextType {
  // Section A: Data Keuangan
  income: string;
  setIncome: (val: string) => void;
  expense: string;
  setExpense: (val: string) => void;
  debt: string;
  setDebt: (val: string) => void;
  savings: string;
  setSavings: (val: string) => void;
  existingInvestment: string;
  setExistingInvestment: (val: string) => void;
  sideIncome: string;
  setSideIncome: (val: string) => void;
  
  // Section B: Profil Demografis
  age: string;
  setAge: (val: string) => void;
  employmentStatus: string;
  setEmploymentStatus: (val: string) => void;
  dependents: string;
  setDependents: (val: string) => void;
  investmentExperience: string;
  setInvestmentExperience: (val: string) => void;
  knownInstruments: string[];
  setKnownInstruments: (val: string[]) => void;
  investmentHorizon: string;
  setInvestmentHorizon: (val: string) => void;
  
  // Section C: Tujuan & Risiko
  goal: string;
  setGoal: (val: string) => void;
  risk: string;
  setRisk: (val: string) => void;
  drawdownReaction: string;
  setDrawdownReaction: (val: string) => void;
  additionalNotes: string;
  setAdditionalNotes: (val: string) => void;
  
  // Pipeline State
  isAnalyzed: boolean;
  setIsAnalyzed: (val: boolean) => void;
  isProcessing: boolean;
  runAgentPipeline: () => Promise<void>;
  resetData: () => void;
  
  // Agent Outputs
  riskProfileData: RiskProfileResult | null;
  wealthAllocationData: WealthAllocationResult | null;
  stressTestData: StressTestResult | null;
  
  // Agentic Outputs
  reasoningTraces: ReasoningTrace[];
  agentPlan: AgentPlan | null;
  
  // Market Data
  marketInstruments: Record<string, MarketInstrument[]>;
  setMarketInstruments: (val: Record<string, MarketInstrument[]>) => void;
  marketSummary: MarketSummary | null;
  setMarketSummary: (val: MarketSummary | null) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  // Section A
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [debt, setDebt] = useState("");
  const [savings, setSavings] = useState("");
  const [existingInvestment, setExistingInvestment] = useState("");
  const [sideIncome, setSideIncome] = useState("");
  
  // Section B
  const [age, setAge] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("karyawan_tetap");
  const [dependents, setDependents] = useState("0");
  const [investmentExperience, setInvestmentExperience] = useState("belum_pernah");
  const [knownInstruments, setKnownInstruments] = useState<string[]>([]);
  const [investmentHorizon, setInvestmentHorizon] = useState("3_5_tahun");
  
  // Section C
  const [goal, setGoal] = useState("pensiun");
  const [risk, setRisk] = useState("moderat");
  const [drawdownReaction, setDrawdownReaction] = useState("tahan");
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  // Pipeline
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Agent outputs
  const [riskProfileData, setRiskProfileData] = useState<RiskProfileResult | null>(null);
  const [wealthAllocationData, setWealthAllocationData] = useState<WealthAllocationResult | null>(null);
  const [stressTestData, setStressTestData] = useState<StressTestResult | null>(null);
  
  // Agentic outputs
  const [reasoningTraces, setReasoningTraces] = useState<ReasoningTrace[]>([]);
  const [agentPlan, setAgentPlan] = useState<AgentPlan | null>(null);
  
  // Market data
  const [marketInstruments, setMarketInstruments] = useState<Record<string, MarketInstrument[]>>({});
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);

  const { user } = useAuthContext();

  const runAgentPipeline = async () => {
    setIsProcessing(true);
    
    const orchestrator = new Orchestrator();
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const result = await orchestrator.runPipeline({
        income,
        expense,
        debt,
        savings,
        existingInvestment,
        sideIncome,
        age,
        employmentStatus,
        dependents,
        investmentExperience,
        knownInstruments,
        investmentHorizon,
        risk,
        goal,
        drawdownReaction,
        additionalNotes,
      }, user?.id || 'default');

      setRiskProfileData(result.riskProfile);
      setWealthAllocationData(result.wealthAllocation);
      setStressTestData(result.stressTest);
      setReasoningTraces(result.reasoningTraces);
      setAgentPlan(result.agentPlan);
      setIsAnalyzed(true);
    } catch (error) {
      console.error("Pipeline failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetData = () => {
    setIsAnalyzed(false);
    setRiskProfileData(null);
    setWealthAllocationData(null);
    setStressTestData(null);
    setReasoningTraces([]);
    setAgentPlan(null);
    // Also clear memory store
    if (user?.id) {
      import('../../services/agents/AgentMemoryStore').then(({ getMemoryStore }) => {
        getMemoryStore(user.id).clear();
      });
    }
  };

  return (
    <FinanceContext.Provider value={{
      income, setIncome,
      expense, setExpense,
      debt, setDebt,
      savings, setSavings,
      existingInvestment, setExistingInvestment,
      sideIncome, setSideIncome,
      age, setAge,
      employmentStatus, setEmploymentStatus,
      dependents, setDependents,
      investmentExperience, setInvestmentExperience,
      knownInstruments, setKnownInstruments,
      investmentHorizon, setInvestmentHorizon,
      goal, setGoal,
      risk, setRisk,
      drawdownReaction, setDrawdownReaction,
      additionalNotes, setAdditionalNotes,
      isAnalyzed, setIsAnalyzed,
      isProcessing,
      runAgentPipeline,
      resetData,
      riskProfileData,
      wealthAllocationData,
      stressTestData,
      reasoningTraces,
      agentPlan,
      marketInstruments, setMarketInstruments,
      marketSummary, setMarketSummary,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinanceContext() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
}
