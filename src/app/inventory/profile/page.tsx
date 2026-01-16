
import { ProfileForm } from '@/components/profile/profile-form';

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Edit Username</h1>
        <p className="text-muted-foreground">
          Update your account settings.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
