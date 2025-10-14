import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { User, Mail, Shield, Save, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const client = generateClient<Schema>();

export function Profile() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Find and update user in database
      const { data: users } = await client.models.User.list({
        filter: { email: { eq: user.email } }
      });

      if (users && users.length > 0) {
        await client.models.User.update({
          id: users[0].id,
          name,
          phone,
        });

        await refreshUser();
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {saved && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-slide-up">
          <Check className="w-5 h-5" />
          <span className="font-semibold">Profile Updated!</span>
        </div>
      )}

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-primary-100">Manage your account information</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="p-8">
              {/* Profile Header */}
              <div className="flex items-center justify-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="space-y-6">
                <div>
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!editing}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center px-4 py-3 bg-gray-100 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!editing}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="flex items-center px-4 py-3 bg-gray-100 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700 capitalize">{user.role}</span>
                    {user.role === 'admin' && (
                      <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                        Administrator
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                {!editing ? (
                  <Button
                    fullWidth
                    variant="primary"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={() => {
                        setEditing(false);
                        setName(user.name);
                        setPhone('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      fullWidth
                      variant="primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        'Saving...'
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2 inline" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>

              {/* Account Stats */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Account Type</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{user.role}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-lg font-semibold text-gray-900">2025</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

