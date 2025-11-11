// src/components/NotificationBar.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const NotificationContext = createContext();

const NotificationBar = ({ id, message, type, removeNotification }) => {
  useEffect(() => {
    const timer = setTimeout(() => removeNotification(id), 4000);
    return () => clearTimeout(timer);
  }, [id, removeNotification]);

  const styles = {
    success: 'bg-green-50 border-green-500 text-green-700',
    error: 'bg-red-50 border-red-500 text-red-700',
    info: 'bg-blue-50 border-blue-500 text-blue-700',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 mr-2 text-green-600" />,
    error: <XCircle className="w-5 h-5 mr-2 text-red-600" />,
    info: <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />,
  };

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center p-4 shadow-lg border-l-4 rounded-md ${styles[type]} w-80`}
    >
      {icons[type] || icons.info}
      <div className="flex-1 text-sm">{message}</div>
      <button
        onClick={() => removeNotification(id)}
        className="ml-3 text-gray-500 hover:text-gray-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const notify = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {notifications.map((n) => (
        <NotificationBar key={n.id} {...n} removeNotification={removeNotification} />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
