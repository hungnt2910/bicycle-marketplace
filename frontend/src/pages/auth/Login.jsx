import React, { useState } from 'react';
import authApi from '../../api/authApi';
// import { useAuth } from '../../contexts/AuthContext';

const Login = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authApi.signin({ email, password });

      if (result.status === 200 && result.data.data && result.data.data.user) {
        const apiUser = result.data.data.user;
        const { accessToken } = result.data.data;

        localStorage.setItem('accessToken', accessToken);
        const fullName = `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim();
        const roleName = apiUser.role ? apiUser.role.toLowerCase() : 'buyer';

        const user = {
          userId: apiUser._id || apiUser.email,
          fullName: fullName,
          email: apiUser.email,
          roleId: null,
          roleName: roleName,
        };

        localStorage.setItem('user', JSON.stringify(user));

        if (onLoginSuccess) {
          onLoginSuccess(user);
        } else {
          window.location.reload();
        }
      } else {
        setError(result.data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-secondary rounded-full blur-3xl opacity-30 animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-ocean rounded-full blur-3xl opacity-30 animate-float"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-sunset rounded-full blur-3xl opacity-20 animate-float"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Login Card */}
      <div className="glass-card rounded-3xl p-8 md:p-12 max-w-md w-full relative z-10 shadow-2xl animate-scaleIn">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-cosmic shadow-lg mb-4">
            <span className="text-white font-black text-3xl"></span>
          </div>
          <h1 className="text-4xl font-black text-gradient mb-2">BICYCLE-MARKETPLACE</h1>
          <p className="text-gray-600 font-medium">Chợ xe đạp uy tín & an toàn</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email "
              className="input"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="input"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-900 px-4 py-3 rounded-xl text-sm font-medium animate-scaleIn">
              {error}
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded text-primary-500" />
              <span className="text-gray-700 group-hover:text-primary-600 transition-colors">
                Nhớ đăng nhập
              </span>
            </label>
            <button
              type="button"
              className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang đăng nhập...</span>
              </div>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6">
          <p className="text-center text-gray-600 text-sm">
            Chưa có tài khoản?{' '}
            <button
              onClick={() => onNavigate && onNavigate('register')}
              className="text-gradient-pink font-bold hover:underline"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>

        <div className="divider my-6"></div>

        {/* Demo Accounts */}
        {/* <div className="glass rounded-xl p-5 border-2 border-primary-200">
          <p className="text-sm font-bold text-primary-900 mb-3 flex items-center gap-2">
            <span className="text-lg"></span>
            Tài khoản Demo
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { role: 'Buyer', email: 'buyer@test.com' },
              { role: 'Seller', email: 'seller@test.com' },
              { role: 'Inspector', email: 'inspector@test.com' },
              { role: 'Admin', email: 'admin@test.com' },
            ].map((account) => (
              <div
                key={account.role}
                className="bg-white/50 p-2 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
                onClick={() => setEmail(account.email)}
              >
                <div className="font-bold text-primary-700">{account.role}</div>
                <div className="text-gray-600 truncate">{account.email}</div>
                <div className="text-gray-500 mt-1">password</div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
