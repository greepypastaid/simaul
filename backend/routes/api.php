<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\MaterialController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\TrackingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/tracking/{trackingCode}', [TrackingController::class, 'show']);
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{service}', [ServiceController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);

        Route::prefix('dashboard')->group(function () {
            Route::get('/', [DashboardController::class, 'index']);
            Route::get('/revenue', [DashboardController::class, 'revenue']);
            Route::get('/services', [DashboardController::class, 'servicesReport']);
            Route::get('/customers', [DashboardController::class, 'customersReport']);
            Route::get('/operations', [DashboardController::class, 'operations']);
        });

        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::get('/stats', [OrderController::class, 'stats']);
            Route::post('/', [OrderController::class, 'store']);
            Route::get('/{order}', [OrderController::class, 'show']);
            Route::post('/{order}/confirm', [OrderController::class, 'confirm']);
            Route::patch('/{order}/status', [OrderController::class, 'updateStatus']);
            Route::patch('/{order}/payment', [OrderController::class, 'updatePayment']);
        });

        Route::prefix('customers')->group(function () {
            Route::get('/', [CustomerController::class, 'index']);
            Route::get('/search', [CustomerController::class, 'search']);
            Route::get('/top', [CustomerController::class, 'topCustomers']);
            Route::post('/', [CustomerController::class, 'store']);
            Route::get('/{customer}', [CustomerController::class, 'show']);
            Route::put('/{customer}', [CustomerController::class, 'update']);
            Route::delete('/{customer}', [CustomerController::class, 'destroy']);
            Route::get('/{customer}/orders', [CustomerController::class, 'orders']);
            Route::post('/{customer}/points', [CustomerController::class, 'adjustPoints']);
        });

        Route::prefix('services')->middleware('auth:sanctum')->group(function () {
            Route::post('/', [ServiceController::class, 'store']);
            Route::put('/{service}', [ServiceController::class, 'update']);
            Route::delete('/{service}', [ServiceController::class, 'destroy']);
            Route::put('/{service}/materials', [ServiceController::class, 'updateMaterials']);
            Route::post('/{service}/toggle-active', [ServiceController::class, 'toggleActive']);
        });

        Route::prefix('materials')->group(function () {
            Route::get('/', [MaterialController::class, 'index']);
            Route::get('/low-stock', [MaterialController::class, 'lowStock']);
            Route::get('/stock-status', [MaterialController::class, 'stockStatus']);
            Route::post('/', [MaterialController::class, 'store']);
            Route::get('/{material}', [MaterialController::class, 'show']);
            Route::put('/{material}', [MaterialController::class, 'update']);
            Route::delete('/{material}', [MaterialController::class, 'destroy']);
            Route::get('/{material}/history', [MaterialController::class, 'history']);
            Route::post('/{material}/add-stock', [MaterialController::class, 'addStock']);
            Route::post('/{material}/adjust-stock', [MaterialController::class, 'adjustStock']);
            Route::post('/{material}/toggle-active', [MaterialController::class, 'toggleActive']);
        });
    });
});
