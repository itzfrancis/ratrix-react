import React, { createContext, useContext, useEffect, useState } from 'react';
import { createFreshClientStore, generateId } from '../utils/helpers';

const DataContext = createContext();

const STORAGE_KEY = 'ratrix_data_v3_clients';

export const DataProvider = ({ children }) => {
    const [store, setStore] = useState({ activeClientId: null, clients: {} });
    const [theme, setTheme] = useState('light');

    // Load from LocalStorage on mount
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.documentElement.setAttribute('data-theme', storedTheme);

        const rawData = localStorage.getItem(STORAGE_KEY);
        if (rawData) {
            try {
                setStore(JSON.parse(rawData));
            } catch (e) { console.error("Data load error", e); }
        } else {
            // Init default if no data exists
            const cid = generateId('c_');
            const initialStore = {
                activeClientId: cid,
                clients: {
                    [cid]: {
                        id: cid,
                        name: "Default Client",
                        description: "",
                        data_store: createFreshClientStore()
                    }
                }
            };
            setStore(initialStore);
        }
    }, []);

    // Save to LocalStorage whenever store changes
    useEffect(() => {
        if (store.activeClientId) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        }
    }, [store]);

    // Theme Toggle
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // --- CLIENT OPERATIONS ---

    const addClient = (name) => {
        const cid = generateId('c_');
        const newClient = {
            id: cid,
            name: name,
            description: "",
            data_store: createFreshClientStore()
        };
        setStore(prev => ({
            ...prev,
            activeClientId: cid,
            clients: { ...prev.clients, [cid]: newClient }
        }));
    };

    const restoreClient = (clientObj) => {
        const cid = generateId('c_');
        // Ensure we give it a fresh ID but keep the data
        const newClient = { ...clientObj, id: cid };
        setStore(prev => ({
            ...prev,
            activeClientId: cid,
            clients: { ...prev.clients, [cid]: newClient }
        }));
    };

    const renameClient = (clientId, newName) => {
        setStore(prev => ({
            ...prev,
            clients: {
                ...prev.clients,
                [clientId]: { ...prev.clients[clientId], name: newName }
            }
        }));
    };

    const deleteClient = (id) => {
        const newClients = { ...store.clients };
        delete newClients[id];
        const newKeys = Object.keys(newClients);
        setStore({
            clients: newClients,
            activeClientId: newKeys.length > 0 ? newKeys[0] : null
        });
    };

    // --- DATA UPDATES ---

    const updateClientData = (clientId, newDataStore) => {
        setStore(prev => ({
            ...prev,
            clients: {
                ...prev.clients,
                [clientId]: { ...prev.clients[clientId], data_store: newDataStore }
            }
        }));
    };

    const updateClientMeta = (clientId, field, value) => {
        setStore(prev => ({
            ...prev,
            clients: {
                ...prev.clients,
                [clientId]: { ...prev.clients[clientId], [field]: value }
            }
        }));
    };

    const setActiveClient = (id) => {
        setStore(prev => ({ ...prev, activeClientId: id }));
    };

    const getActiveClient = () => {
        return store.clients[store.activeClientId];
    };

    return (
        <DataContext.Provider value={{
            store,
            theme,
            toggleTheme,
            addClient,
            restoreClient,
            renameClient,
            deleteClient,
            setActiveClient,
            getActiveClient,
            updateClientData,
            updateClientMeta
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);