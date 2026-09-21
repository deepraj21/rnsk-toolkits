// @ts-nocheck
import { kaggleCompetitionDownloadFiles, kaggleCompetitionSubmit, kaggleDownloadCompetitionFile, kaggleDownloadCompetitionLeaderboard, kaggleGenerateCompetitionSubmissionUrl, kaggleListCompetitionFiles, kaggleListCompetitions, kaggleViewCompetitionLeaderboard } from './competitions.js';
export { kaggleCompetitionDownloadFiles, kaggleCompetitionSubmit, kaggleDownloadCompetitionFile, kaggleDownloadCompetitionLeaderboard, kaggleGenerateCompetitionSubmissionUrl, kaggleListCompetitionFiles, kaggleListCompetitions, kaggleViewCompetitionLeaderboard };
import { kaggleConfigDir, kaggleConfigInit, kaggleConfigKeys, kaggleConfigPath, kaggleConfigReset, kaggleConfigSet, kaggleConfigUnset, kaggleConfigView } from './config.js';
export { kaggleConfigDir, kaggleConfigInit, kaggleConfigKeys, kaggleConfigPath, kaggleConfigReset, kaggleConfigSet, kaggleConfigUnset, kaggleConfigView };
import { kaggleDatasetCreate, kaggleDatasetInit, kaggleDatasetListFiles, kaggleDatasetStatus, kaggleDatasetVersion, kaggleDownloadDataset, kaggleDownloadDatasetFile, kaggleGetDatasetMetadata, kaggleListDatasets } from './datasets.js';
export { kaggleDatasetCreate, kaggleDatasetInit, kaggleDatasetListFiles, kaggleDatasetStatus, kaggleDatasetVersion, kaggleDownloadDataset, kaggleDownloadDatasetFile, kaggleGetDatasetMetadata, kaggleListDatasets };
import { kaggleGetModel, kaggleListModels } from './models.js';
export { kaggleGetModel, kaggleListModels };
import { kaggleGetModelInstance } from './model_instances.js';
export { kaggleGetModelInstance };
import { kaggleKernelInit, kaggleKernelOutput, kaggleKernelsStatus, kaggleListKernelOutputFiles, kaggleListKernels, kagglePullKernel } from './kernels.js';
export { kaggleKernelInit, kaggleKernelOutput, kaggleKernelsStatus, kaggleListKernelOutputFiles, kaggleListKernels, kagglePullKernel };
import { kaggleListModelInstanceVersionFiles } from './model_instance_files.js';
export { kaggleListModelInstanceVersionFiles };

export const kaggleTools = [
    { name: 'kaggleCompetitionDownloadFiles', description: kaggleCompetitionDownloadFiles.description!, tool: kaggleCompetitionDownloadFiles, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleCompetitionSubmit', description: kaggleCompetitionSubmit.description!, tool: kaggleCompetitionSubmit, requiredAuth: 'kaggleCredentials' as const, scope: 'write' as const },
    { name: 'kaggleConfigDir', description: kaggleConfigDir.description!, tool: kaggleConfigDir, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleConfigInit', description: kaggleConfigInit.description!, tool: kaggleConfigInit, requiredAuth: 'kaggleCredentials' as const, scope: 'write' as const },
    { name: 'kaggleConfigKeys', description: kaggleConfigKeys.description!, tool: kaggleConfigKeys, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleConfigPath', description: kaggleConfigPath.description!, tool: kaggleConfigPath, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleConfigReset', description: kaggleConfigReset.description!, tool: kaggleConfigReset, requiredAuth: 'kaggleCredentials' as const, scope: 'write' as const },
    { name: 'kaggleConfigSet', description: kaggleConfigSet.description!, tool: kaggleConfigSet, requiredAuth: 'kaggleCredentials' as const, scope: 'write' as const },
    { name: 'kaggleConfigUnset', description: kaggleConfigUnset.description!, tool: kaggleConfigUnset, requiredAuth: 'kaggleCredentials' as const, scope: 'write' as const },
    { name: 'kaggleConfigView', description: kaggleConfigView.description!, tool: kaggleConfigView, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleDatasetCreate', description: kaggleDatasetCreate.description!, tool: kaggleDatasetCreate, requiredAuth: 'kaggleCredentials' as const, scope: 'write' as const },
    { name: 'kaggleDatasetInit', description: kaggleDatasetInit.description!, tool: kaggleDatasetInit, requiredAuth: 'kaggleCredentials' as const, scope: 'write' as const },
    { name: 'kaggleDatasetListFiles', description: kaggleDatasetListFiles.description!, tool: kaggleDatasetListFiles, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleDatasetStatus', description: kaggleDatasetStatus.description!, tool: kaggleDatasetStatus, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleDatasetVersion', description: kaggleDatasetVersion.description!, tool: kaggleDatasetVersion, requiredAuth: 'kaggleCredentials' as const, scope: 'write' as const },
    { name: 'kaggleDownloadCompetitionFile', description: kaggleDownloadCompetitionFile.description!, tool: kaggleDownloadCompetitionFile, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleDownloadCompetitionLeaderboard', description: kaggleDownloadCompetitionLeaderboard.description!, tool: kaggleDownloadCompetitionLeaderboard, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleDownloadDataset', description: kaggleDownloadDataset.description!, tool: kaggleDownloadDataset, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleDownloadDatasetFile', description: kaggleDownloadDatasetFile.description!, tool: kaggleDownloadDatasetFile, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleGenerateCompetitionSubmissionUrl', description: kaggleGenerateCompetitionSubmissionUrl.description!, tool: kaggleGenerateCompetitionSubmissionUrl, requiredAuth: 'kaggleCredentials' as const, scope: 'write' as const },
    { name: 'kaggleGetDatasetMetadata', description: kaggleGetDatasetMetadata.description!, tool: kaggleGetDatasetMetadata, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleGetModel', description: kaggleGetModel.description!, tool: kaggleGetModel, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleGetModelInstance', description: kaggleGetModelInstance.description!, tool: kaggleGetModelInstance, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleKernelInit', description: kaggleKernelInit.description!, tool: kaggleKernelInit, requiredAuth: 'kaggleCredentials' as const, scope: 'write' as const },
    { name: 'kaggleKernelOutput', description: kaggleKernelOutput.description!, tool: kaggleKernelOutput, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleKernelsStatus', description: kaggleKernelsStatus.description!, tool: kaggleKernelsStatus, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleListCompetitionFiles', description: kaggleListCompetitionFiles.description!, tool: kaggleListCompetitionFiles, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleListCompetitions', description: kaggleListCompetitions.description!, tool: kaggleListCompetitions, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleListDatasets', description: kaggleListDatasets.description!, tool: kaggleListDatasets, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleListKernelOutputFiles', description: kaggleListKernelOutputFiles.description!, tool: kaggleListKernelOutputFiles, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleListKernels', description: kaggleListKernels.description!, tool: kaggleListKernels, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleListModelInstanceVersionFiles', description: kaggleListModelInstanceVersionFiles.description!, tool: kaggleListModelInstanceVersionFiles, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleListModels', description: kaggleListModels.description!, tool: kaggleListModels, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kagglePullKernel', description: kagglePullKernel.description!, tool: kagglePullKernel, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
    { name: 'kaggleViewCompetitionLeaderboard', description: kaggleViewCompetitionLeaderboard.description!, tool: kaggleViewCompetitionLeaderboard, requiredAuth: 'kaggleCredentials' as const, scope: 'read' as const },
];
