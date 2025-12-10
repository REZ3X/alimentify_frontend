import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const API_KEY = process.env.API_KEY;

async function proxyRequest(request, params) {
    const { path } = await params;
    const pathString = Array.isArray(path) ? path.join('/') : path;

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const targetUrl = `${BACKEND_URL}/api/${pathString}${queryString ? `?${queryString}` : ''}`;

    const headers = new Headers();

    if (API_KEY) {
        headers.set('x-api-key', API_KEY);
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
        headers.set('Authorization', authHeader);
    }

    const contentType = request.headers.get('content-type');
    if (contentType) {
        headers.set('Content-Type', contentType);
    }

    const fetchOptions = {
        method: request.method,
        headers,
    };

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        if (contentType && contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            fetchOptions.body = formData;
            headers.delete('Content-Type');
        } else {
            try {
                const body = await request.text();
                if (body) {
                    fetchOptions.body = body;
                }
            } catch (e) {
            }
        }
    }

    try {
        const response = await fetch(targetUrl, fetchOptions);

        const responseText = await response.text();

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = responseText;
        }

        return NextResponse.json(
            typeof responseData === 'string' ? { data: responseData } : responseData,
            { status: response.status }
        );
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to connect to backend service' },
            { status: 502 }
        );
    }
}

export async function GET(request, { params }) {
    return proxyRequest(request, params);
}

export async function POST(request, { params }) {
    return proxyRequest(request, params);
}

export async function PUT(request, { params }) {
    return proxyRequest(request, params);
}

export async function PATCH(request, { params }) {
    return proxyRequest(request, params);
}

export async function DELETE(request, { params }) {
    return proxyRequest(request, params);
}
