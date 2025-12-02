import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter, 
  Alert, 
  AlertDescription 
} from '@/components/ui';

const EMAIL_REGEX = /\S+@\S+\.\S+/;

const INITIAL_FORM_DATA = {
  email: '',
  password: '',
};

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email wajib diisi';
    } else if (!EMAIL_REGEX.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (!formData.password) {
      errors.password = 'Password wajib diisi';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 mb-4 inline-block">
          Simaul
        </Link>
        <CardTitle>Selamat Datang</CardTitle>
        <CardDescription>Masuk ke akun Anda</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="email@contoh.com"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            disabled={isLoading}
          />
          
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            disabled={isLoading}
          />
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Masuk
          </Button>
          <p className="text-sm text-center text-gray-600">
            Belum punya akun?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Daftar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default LoginPage;
