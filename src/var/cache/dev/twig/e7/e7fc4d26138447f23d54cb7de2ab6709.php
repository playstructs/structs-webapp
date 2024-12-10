<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Extension\CoreExtension;
use Twig\Extension\SandboxExtension;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;
use Twig\TemplateWrapper;

/* @WebProfiler/Icon/memory.svg */
class __TwigTemplate_049ccdbc76cc2850902b3a1736124d6f extends Template
{
    private Source $source;
    /**
     * @var array<string, Template>
     */
    private array $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->parent = false;

        $this->blocks = [
        ];
    }

    protected function doDisplay(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@WebProfiler/Icon/memory.svg"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@WebProfiler/Icon/memory.svg"));

        // line 1
        yield "<svg xmlns=\"http://www.w3.org/2000/svg\" data-icon-name=\"icon-tabler-cpu\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" role=\"img\">
    <title>Memory</title>
    <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"></path>
    <rect x=\"5\" y=\"5\" width=\"14\" height=\"14\" rx=\"1\"></rect>
    <path d=\"M9 9h6v6h-6z\"></path>
    <path d=\"M3 10h2\"></path>
    <path d=\"M3 14h2\"></path>
    <path d=\"M10 3v2\"></path>
    <path d=\"M14 3v2\"></path>
    <path d=\"M21 10h-2\"></path>
    <path d=\"M21 14h-2\"></path>
    <path d=\"M14 21v-2\"></path>
    <path d=\"M10 21v-2\"></path>
</svg>
";
        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        yield from [];
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName(): string
    {
        return "@WebProfiler/Icon/memory.svg";
    }

    /**
     * @codeCoverageIgnore
     */
    public function getDebugInfo(): array
    {
        return array (  48 => 1,);
    }

    public function getSourceContext(): Source
    {
        return new Source("<svg xmlns=\"http://www.w3.org/2000/svg\" data-icon-name=\"icon-tabler-cpu\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" role=\"img\">
    <title>Memory</title>
    <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"></path>
    <rect x=\"5\" y=\"5\" width=\"14\" height=\"14\" rx=\"1\"></rect>
    <path d=\"M9 9h6v6h-6z\"></path>
    <path d=\"M3 10h2\"></path>
    <path d=\"M3 14h2\"></path>
    <path d=\"M10 3v2\"></path>
    <path d=\"M14 3v2\"></path>
    <path d=\"M21 10h-2\"></path>
    <path d=\"M21 14h-2\"></path>
    <path d=\"M14 21v-2\"></path>
    <path d=\"M10 21v-2\"></path>
</svg>
", "@WebProfiler/Icon/memory.svg", "/src/vendor/symfony/web-profiler-bundle/Resources/views/Icon/memory.svg");
    }
}
