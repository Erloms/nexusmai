import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"; // Updated import
import { Trash2, Search, UserCheck, UserX } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  isPaid: boolean;
}

interface PaymentRequest {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'rejected';
}

interface Props {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserManagement = ({ users, setUsers }: Props) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  useEffect(() => {
    const loadPaymentRequests = () => {
      const requests = localStorage.getItem('nexusAi_payment_requests');
      if (requests) {
        const parsedRequests = JSON.parse(requests).map((req: any) => ({
          ...req,
          status: req.status as 'pending' | 'completed' | 'rejected'
        }));
        setPaymentRequests(parsedRequests);
      }
    };
    
    loadPaymentRequests();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const deleteUser = (userId: string) => {
    const confirmDelete = window.confirm("确定要删除该用户吗？");
    if (!confirmDelete) return;

    const updatedUsers = users.filter(user => user.id !== userId);
    localStorage.setItem('nexusAi_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Also remove any payment requests associated with the user
    const updatedRequests = paymentRequests.filter(req => req.userId !== userId);
    setPaymentRequests(updatedRequests);
    localStorage.setItem('nexusAi_payment_requests', JSON.stringify(updatedRequests));

    toast({
      title: "删除成功",
      description: "用户已成功删除",
    });
  };

  const rejectPayment = (requestId: string) => {
    const updatedRequests = paymentRequests.map(req =>
      req.id === requestId ? { ...req, status: 'rejected' as const } : req
    );
    setPaymentRequests(updatedRequests);
    localStorage.setItem('nexusAi_payment_requests', JSON.stringify(updatedRequests));

    toast({
      title: "已拒绝",
      description: "支付请求已拒绝",
    });
  };

  const approveVIP = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('nexusAi_users') || '[]');
    const updatedUsers = users.map((user: any) => 
      user.id === userId ? { ...user, isPaid: true } : user
    );
    
    localStorage.setItem('nexusAi_users', JSON.stringify(updatedUsers));
    
    const updatedRequests = paymentRequests.map(req => 
      req.userId === userId ? { ...req, status: 'completed' as const } : req
    );
    setPaymentRequests(updatedRequests);
    localStorage.setItem('nexusAi_payment_requests', JSON.stringify(updatedRequests));
    
    setUsers(updatedUsers);
    
    toast({
      title: "VIP开通成功",
      description: `用户 ${userId} 已成功开通VIP会员`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="搜索用户..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
        />
        <Search className="h-5 w-5 text-white/50" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-nexus-blue/50">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-2 text-white">用户名</th>
              <th className="px-4 py-2 text-white">邮箱</th>
              <th className="px-4 py-2 text-white">VIP状态</th>
              <th className="px-4 py-2 text-white">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nexus-blue/50">
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-2 text-white">{user.name}</td>
                <td className="px-4 py-2 text-white">{user.email}</td>
                <td className="px-4 py-2 text-white">
                  {user.isPaid ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <UserCheck className="h-4 w-4" />
                      <span>已开通</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500">
                      <UserX className="h-4 w-4" />
                      <span>未开通</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-2">支付请求</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-nexus-blue/50">
            <thead>
              <tr>
                <th className="px-4 py-2 text-white">用户ID</th>
                <th className="px-4 py-2 text-white">金额</th>
                <th className="px-4 py-2 text-white">支付方式</th>
                <th className="px-4 py-2 text-white">时间</th>
                <th className="px-4 py-2 text-white">状态</th>
                <th className="px-4 py-2 text-white">操作</th>
              </tr>
            </thead>
            <tbody>
              {paymentRequests.map(request => (
                <tr key={request.id}>
                  <td className="px-4 py-2 text-white">{request.userId}</td>
                  <td className="px-4 py-2 text-white">{request.amount}</td>
                  <td className="px-4 py-2 text-white">{request.paymentMethod}</td>
                  <td className="px-4 py-2 text-white">{request.timestamp}</td>
                  <td className="px-4 py-2 text-white">{request.status}</td>
                  <td className="px-4 py-2">
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveVIP(request.userId)}
                        >
                          批准
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => rejectPayment(request.id)}
                        >
                          拒绝
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;