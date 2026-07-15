"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Orchestrator } from '../../services/agents/Orchestrator';
import { RiskProfileResult, WealthAllocationResult, StressTestResult } from '../../services/agents/types';

interface FinanceContextType {
  income: string;
  setIncome: (val: string) => void;
  expense: string;
  setExpense: (val: string) => void;
  debt: string;
  setDebt: (val: string) => void;
  savings: string;
  setSavings: (val: string) => void;
  goal: string;
  setGoal: (val: string) => void;
  risk: string;
  setRisk: (val: string) => void;
  isAnalyzed: boolean;
  setIsAnalyzed: (val: boolean) => void;
  
  // Agent Pipeline State
  isProcessing: boolean;
  runAgentPipeline: () => Promise<void>;
  
  // Agent Outputs
  riskProfileData: RiskProfileResult | null;
  wealthAllocationData: WealthAllocationResult | null;
  stressTestData: StressTestResult | null;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [income, setIncome] = useState("15000000");
  const [expense, setExpense] = useState("8000000");
  const [debt, setDebt] = useState("2000000");
  const [savings, setSavings] = useState("30000000");
  const [goal, setGoal] = useState("pensiun");
  const [risk, setRisk] = useState("MODERAT");
  
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Data layers populated by Agents
  const [riskProfileData, setRiskProfileData] = useState<RiskProfileResult | null>(null);
  const [wealthAllocationData, setWealthAllocationData] = useState<WealthAllocationResult | null>(null);
  const [stressTestData, setStressTestData] = useState<StressTestResult | null>(null);

  const runAgentPipeline = async () => {
    setIsProcessing(true);
    
    const orchestrator = new Orchestrator();
    
    // Simulate delay for AI thinking (can be removed later)
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const result = await orchestrator.runPipeline({
        income,
        expense,
        debt,
        savings,
        risk
      });

      setRiskProfileData(result.riskProfile);
      setWealthAllocationData(result.wealthAllocation);
      setStressTestData(result.stressTest);
      setIsAnalyzed(true);
    } catch (error) {
      console.error("Pipeline failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FinanceContext.Provider value={{
      income, setIncome,
      expense, setExpense,
      debt, setDebt,
      savings, setSavings,
      goal, setGoal,
      risk, setRisk,
      isAnalyzed, setIsAnalyzed,
      
      isProcessing,
      runAgentPipeline,
      riskProfileData,
      wealthAllocationData,
      stressTestData
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
