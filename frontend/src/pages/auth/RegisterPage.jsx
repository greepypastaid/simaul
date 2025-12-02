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
const MIN_NAME_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 8;

const INITIAL_FORM_DATA = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
};

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  
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
    
    if (!formData.name) {
      errors.name = 'Nama wajib diisi';
    } else if (formData.name.length < MIN_NAME_LENGTH) {
      errors.name = `Nama minimal ${MIN_NAME_LENGTH} karakter`;
    }
    
    if (!formData.email) {
      errors.email = 'Email wajib diisi';
    } else if (!EMAIL_REGEX.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (!formData.password) {
      errors.password = 'Password wajib diisi';
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password minimal ${MIN_PASSWORD_LENGTH} karakter`;
    }
    
    if (!formData.password_confirmation) {
      errors.password_confirmation = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Password tidak sama';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await register(formData);
    
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
        <CardTitle>Buat Akun Baru</CardTitle>
        <CardDescription>Daftar untuk memulai menggunakan Simaul</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Input
            label="Nama Lengkap"
            type="text"
            name="name"
            placeholder="Nama Anda"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            disabled={isLoading}
          />
          
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
          
          <Input
            label="Konfirmasi Password"
            type="password"
            name="password_confirmation"
            placeholder="••••••••"
            value={formData.password_confirmation}
            onChange={handleChange}
            error={formErrors.password_confirmation}
            disabled={isLoading}
          />
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Daftar
          </Button>
          <p className="text-sm text-center text-gray-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Masuk
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default RegisterPage;
