import React, { useEffect, useState } from 'react';
import { getParticipants, updateParticipant, removeParticipant } from '../../../../server/controllers/participant.controller';

export function ParticipantManager() {
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    const { data } = await getParticipants();
    if (data) setParticipants(data);
  };

  const handleAction = async (id: string, action: string) => {
    await updateParticipant(id, action);
    fetchParticipants();
  };

  const handleDelete = async (id: string) => {
    await removeParticipant(id);
    fetchParticipants();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Participant Manager</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.full_name}</td>
              <td className="border p-2">{p.status}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleAction(p.id, 'auditioned')} className="bg-blue-500 text-white px-2 py-1">Audition</button>
                <button onClick={() => handleAction(p.id, 'qualified')} className="bg-green-500 text-white px-2 py-1">Qualify</button>
                <button onClick={() => handleAction(p.id, 'evicted')} className="bg-red-500 text-white px-2 py-1">Evict</button>
                <button onClick={() => handleDelete(p.id)} className="bg-gray-500 text-white px-2 py-1">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
