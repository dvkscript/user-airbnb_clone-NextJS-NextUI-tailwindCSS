import { Params } from 'next/dist/shared/lib/router/utils/route-matcher'
import CallbackClient from './CallbackClient';
import LoaderSpinner from '@/components/Loader/LoaderSpinner';
import { ApiProviders } from '@/configs/apiRouter.config';
import { socialLoginCallBack } from '@/services/auth.service';

interface CallbackPageProps {
    params: Params;
    searchParams: Params;
}

const CallbackPage = async ({ params, searchParams, }: CallbackPageProps) => {
    const { provider } = params;
    let result: any;
    if (ApiProviders.includes(provider)) {
        result = await socialLoginCallBack(provider, searchParams);
    } else {
        result = null;
    }
    
    return (
        <div className='w-full h-screen flex justify-center items-center'>
            <LoaderSpinner />
            <CallbackClient data={result} />
        </div>
    );
}

export default CallbackPage