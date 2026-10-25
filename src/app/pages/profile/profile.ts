import { Component, inject } from '@angular/core';
import { AccountMode, AccountProfileService } from '../../core/account-profile';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile.html',
  styleUrl: './profile.less',
  standalone: false,
})
export class ProfilePage {
  readonly auth = inject(AuthService);
  readonly profiles = inject(AccountProfileService);

  async chooseMode(mode: AccountMode): Promise<void> {
    try {
      await this.profiles.saveAccountMode(mode);
    } catch {
      // The profile service exposes a localized error message.
    }
  }
}
