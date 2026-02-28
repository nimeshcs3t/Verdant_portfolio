import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext({});

const DARK = {
  bg: '#0D1117', card: '#161B22', card2: '#21262D', border: '#30363D',
  text: '#E6EDF3', muted: '#8B949E', primary: '#58A6FF',
  green: '#3FB950', red: '#F85149', gold: '#D29922', tabBar: '#161B22',
};
const LIGHT = {
  bg: '#F6F8FA', card: '#FFFFFF', card2: '#F0F4F8', border: '#D0D7DE',
  text: '#1C2128', muted: '#57606A', primary: '#0969DA',
  green: '#1A7F37', red: '#CF222E', gold: '#9A6700', tabBar: '#FFFFFF',
};

export function AppProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [journal, setJournal] = useState([]);
  const [prices, setPrices] = useState({});

  useEffect(() => {
    (async () => {
      const [tx, jn, dark, hidden] = await Promise.all([
        AsyncStorage.getItem('pt_tx'),
        AsyncStorage.getItem('pt_journal'),
        AsyncStorage.getItem('pt_dark'),
        AsyncStorage.getItem('pt_hidden'),
      ]);
      if (tx) setTransactions(JSON.parse(tx));
      if (jn) setJournal(JSON.parse(jn));
      if (dark !== null) setIsDark(JSON.parse(dark));
      if (hidden !== null) setIsHidden(JSON.parse(hidden));
    })();
  }, []);

  const saveTx = async (list) => {
    setTransactions(list);
    await AsyncStorage.setItem('pt_tx', JSON.stringify(list));
  };
  const saveJournal = async (list) => {
    setJournal(list);
    await AsyncStorage.setItem('pt_journal', JSON.stringify(list));
  };

  const toggleDark = async () => {
    const v = !isDark; setIsDark(v);
    await AsyncStorage.setItem('pt_dark', JSON.stringify(v));
  };
  const toggleHidden = async () => {
    const v = !isHidden; setIsHidden(v);
    await AsyncStorage.setItem('pt_hidden', JSON.stringify(v));
  };

  const addTransaction = (tx) =>
    saveTx([{ ...tx, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...transactions]);
  const deleteTransaction = (id) => saveTx(transactions.filter(t => t.id !== id));

  const addJournalEntry = (e) =>
    saveJournal([{ ...e, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...journal]);
  const updateJournalEntry = (id, data) =>
    saveJournal(journal.map(e => e.id === id ? { ...e, ...data } : e));
  const deleteJournalEntry = (id) => saveJournal(journal.filter(e => e.id !== id));

  const getHoldings = () => {
    const map = {};
    [...transactions].reverse().forEach(tx => {
      const k = tx.symbol.toUpperCase();
      if (!map[k]) map[k] = { symbol: k, name: tx.name || k, type: tx.assetType || 'STOCK', shares: 0, totalCost: 0, targetAllocation: 0 };
      if (tx.type === 'BUY') { map[k].shares += +tx.shares; map[k].totalCost += +tx.shares * +tx.price; }
      else if (tx.type === 'SELL') { map[k].shares -= +tx.shares; map[k].totalCost -= +tx.shares * +tx.price; }
      if (tx.targetAllocation) map[k].targetAllocation = +tx.targetAllocation;
    });
    return Object.values(map).filter(h => h.shares > 0.000001).map(h => {
      const livePrice = prices[h.symbol]?.price;
      const currentPrice = livePrice || (h.shares > 0 ? h.totalCost / h.shares : 0);
      const currentValue = h.shares * currentPrice;
      const gainLoss = currentValue - h.totalCost;
      const gainLossPct = h.totalCost > 0 ? (gainLoss / h.totalCost) * 100 : 0;
      const todayChange = (prices[h.symbol]?.change || 0) * h.shares;
      const todayChangePct = prices[h.symbol]?.changePercent || 0;
      return { ...h, currentPrice, currentValue, gainLoss, gainLossPct, avgCost: h.totalCost / h.shares, todayChange, todayChangePct };
    });
  };

  const getMetrics = () => {
    const holdings = getHoldings();
    const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const totalCost = holdings.reduce((s, h) => s + h.totalCost, 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const todayGainLoss = holdings.reduce((s, h) => s + h.todayChange, 0);
    const todayGainLossPct = (totalValue - todayGainLoss) > 0 ? (todayGainLoss / (totalValue - todayGainLoss)) * 100 : 0;
    return { holdings, totalValue, totalCost, totalGainLoss, totalGainLossPct, todayGainLoss, todayGainLossPct };
  };

  const C = isDark ? DARK : LIGHT;

  return (
    <AppContext.Provider value={{
      isDark, isHidden, C, toggleDark, toggleHidden,
      transactions, addTransaction, deleteTransaction,
      journal, addJournalEntry, updateJournalEntry, deleteJournalEntry,
      prices, setPrices, getHoldings, getMetrics,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
