<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'role' => UserRole::class,
        ];
    }

    public function createdOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'created_by');
    }

    public function orderHistories(): HasMany
    {
        return $this->hasMany(OrderHistory::class, 'created_by');
    }

    /**
     * Check if user is owner (has full access to all features)
     * Owner combines: admin, staff/operational, and cashier roles
     */
    public function isOwner(): bool
    {
        return $this->role === UserRole::OWNER;
    }

    /**
     * Check if user has admin privileges (owner has all privileges)
     */
    public function isAdmin(): bool
    {
        return $this->isOwner();
    }

    /**
     * Check if user has staff privileges (owner has all privileges)
     */
    public function isStaff(): bool
    {
        return $this->isOwner();
    }

    /**
     * Check if user has cashier privileges (owner has all privileges)
     */
    public function isCashier(): bool
    {
        return $this->isOwner();
    }
}
