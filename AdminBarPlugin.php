<?php

declare(strict_types=1);

namespace Plugin\AdminBar;

use App\Infrastructure\Services\Plugin;
use App\Shared\Services\Registry;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;
use Psr\SimpleCache\InvalidArgumentException;
use Qubus\EventDispatcher\ActionFilter\Action;
use Qubus\Exception\Exception;
use ReflectionException;

use function App\Shared\Helpers\cms_enqueue_css;
use function App\Shared\Helpers\is_user_logged_in;
use function App\Shared\Helpers\plugin_basename;
use function App\Shared\Helpers\plugin_dir_path;
use function App\Shared\Helpers\plugin_url;
use function dirname;
use function get_class;
use function Qubus\Security\Helpers\esc_html__;
use function Qubus\Security\Helpers\t__;

class AdminBarPlugin extends Plugin
{
    /**
     * @inheritDoc
     * @throws ReflectionException|Exception
     */
    public function meta(): array
    {
        $plugin = [
            'name' => esc_html__(string: 'AdminBar', domain: 'adminbar'),
            'id' => 'adminbar',
            'author' => 'Joshua Parker',
            'version' => '2.0.0',
            'description' => t__(msgid: 'Adds an admin bar to Devflow site.', domain: 'adminbar'),
            'basename' => plugin_basename(dirname(__FILE__)),
            'path' => plugin_dir_path(dirname(__FILE__)),
            'url' => plugin_url('', __CLASS__),
            'pluginUri' => 'https://github.com/getdevflow/adminbar',
            'authorUri' => 'https://nomadicjosh.com/',
            'className' => get_class($this),
        ];

        Registry::getInstance()->set('adminbar', $plugin);

        return $plugin;
    }

    /**
     * @inheritDoc
     * @throws ReflectionException
     */
    public function handle(): void
    {
        Action::getInstance()->addAction('init', [$this, 'render'], 1);
        Action::getInstance()->addAction('cms_admin_head', [$this, 'enqueueCss'], 99);
    }

    /**
     * @throws Exception
     */
    public function enqueueCss(): void
    {
        cms_enqueue_css(
            config: 'plugin',
            asset: $this->url() . '/css/style.css',
            slug: $this->id()
        );
    }

    /**
     * @throws ContainerExceptionInterface
     * @throws Exception
     * @throws InvalidArgumentException
     * @throws NotFoundExceptionInterface
     * @throws ReflectionException
     */
    public function render(): void
    {
        if (!is_user_logged_in()) {
            return;
        }
        echo $this->view->render('plugin::AdminBar/view/index', ['plugin' => $this->meta()]);
    }
}
