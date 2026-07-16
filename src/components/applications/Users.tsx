import { useQuery } from '@tanstack/react-query';
import Loader from '../Loader';
import api from '../../common/api';

export function Users() {
    const {
        data,
        isLoading,
        isError,
        error,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/auth/users');
            if (!response.data) {
                throw new Error('Failed to fetch users');
            }
            console.log('Fetched users:', response);
            return response.data.users;
        },
    });

    return (
        <div className="p-4 border">
            <div className="flex items-center justify-center mb-8">
                <h1 className="text-3xl font-bold">
                    TanStack Query
                </h1>

                <button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >Refresh
                </button>
            </div>
            {(isRefetching || isLoading) ? <Loader /> :
                (isError) ?
                    <p className="text-red-500">
                        {(error as Error).message}
                    </p> :
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg font-semibold text-gray-700">
                        {data?.map((user: any, index: number) => {
                            const isLastItem = index === data.length - 1;
                            const isOddCount = data.length % 2 !== 0;

                            return (
                                <li
                                    key={user.id}
                                    className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200
          ${isOddCount && isLastItem
                                            ? 'sm:col-span-2 sm:justify-self-center sm:w-1/2'
                                            : ''
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-gray-900">{user.name}</span>

                                        {user.email && (
                                            <span className="text-sm text-gray-500 mt-1">
                                                {user.email}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
            }
        </div>
    );
}