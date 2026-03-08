import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';
import api from '../services/api';

vi.mock('../services/api');

describe('Login Component', () => {
    it('renders login form', () => {
        render(<BrowserRouter><Login /></BrowserRouter>);
        expect(screen.getByText('Invoice Portal')).toBeInTheDocument();
        expect(screen.getByLabelText(/Company Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    it('shows error on invalid credentials', async () => {
        (api.post as any).mockRejectedValue(new Error('Unauthorized'));

        render(<BrowserRouter><Login /></BrowserRouter>);

        const signInButton = screen.getByRole('button', { name: /Sign In/i });
        fireEvent.click(signInButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });
});
